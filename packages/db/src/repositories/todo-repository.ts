import { eq, and, desc, asc, ilike, or, lte, gte, count } from 'drizzle-orm';
import { db } from '../client.js';
import { todos, type DbTodo } from '../schema/todos.js';

export interface DbTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date | null;
  tags?: string[];
}

export interface DbTodoUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date | null;
  tags?: string[];
}

export interface DbTodoQuery {
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  search?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  sort?: {
    field: 'createdAt' | 'dueDate' | 'priority' | 'title';
    order: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export class PostgresTodoRepository {
  constructor(private userId: string) {}

  async create(input: DbTodoInput): Promise<Todo> {
    const [row] = await db
      .insert(todos)
      .values({
        userId: this.userId,
        title: input.title,
        description: input.description ?? '',
        priority: input.priority ?? 'medium',
        dueDate: input.dueDate ?? null,
        tags: input.tags ?? [],
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create todo');
    }

    return this.mapToTodo(row);
  }

  async findById(id: string): Promise<Todo | null> {
    const [row] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    return row ? this.mapToTodo(row) : null;
  }

  async findAll(query?: DbTodoQuery): Promise<Todo[]> {
    const conditions = [eq(todos.userId, this.userId)];

    if (query?.status) {
      conditions.push(eq(todos.status, query.status));
    }

    if (query?.priority) {
      conditions.push(eq(todos.priority, query.priority));
    }

    if (query?.search) {
      conditions.push(
        or(
          ilike(todos.title, `%${query.search}%`),
          ilike(todos.description, `%${query.search}%`)
        )!
      );
    }

    if (query?.dueBefore) {
      conditions.push(lte(todos.dueDate, query.dueBefore));
    }

    if (query?.dueAfter) {
      conditions.push(gte(todos.dueDate, query.dueAfter));
    }

    let queryBuilder = db
      .select()
      .from(todos)
      .where(and(...conditions));

    // Sorting
    const sortField = query?.sort?.field ?? 'createdAt';
    const sortOrder = query?.sort?.order ?? 'desc';
    const orderFn = sortOrder === 'desc' ? desc : asc;

    switch (sortField) {
      case 'createdAt':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.createdAt)) as typeof queryBuilder;
        break;
      case 'dueDate':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.dueDate)) as typeof queryBuilder;
        break;
      case 'priority':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.priority)) as typeof queryBuilder;
        break;
      case 'title':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.title)) as typeof queryBuilder;
        break;
    }

    // Pagination
    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit) as typeof queryBuilder;
    }

    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset) as typeof queryBuilder;
    }

    const rows = await queryBuilder;
    return rows.map((row) => this.mapToTodo(row));
  }

  async update(id: string, input: DbTodoUpdate): Promise<Todo> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData['title'] = input.title;
    if (input.description !== undefined) updateData['description'] = input.description;
    if (input.status !== undefined) updateData['status'] = input.status;
    if (input.priority !== undefined) updateData['priority'] = input.priority;
    if (input.dueDate !== undefined) updateData['dueDate'] = input.dueDate;
    if (input.tags !== undefined) updateData['tags'] = input.tags;

    // Handle completion
    if (input.status === 'completed') {
      updateData['completedAt'] = new Date();
    } else if (input.status === 'pending' || input.status === 'in_progress') {
      updateData['completedAt'] = null;
    }

    const [row] = await db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)))
      .returning();

    if (!row) {
      throw new Error(`Todo not found: ${id}`);
    }

    return this.mapToTodo(row);
  }

  async delete(id: string): Promise<void> {
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    if (result.rowCount === 0) {
      throw new Error(`Todo not found: ${id}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    return !!row;
  }

  async count(query?: DbTodoQuery): Promise<number> {
    const conditions = [eq(todos.userId, this.userId)];

    if (query?.status) {
      conditions.push(eq(todos.status, query.status));
    }

    if (query?.priority) {
      conditions.push(eq(todos.priority, query.priority));
    }

    const result = await db
      .select({ count: count() })
      .from(todos)
      .where(and(...conditions));

    return result[0]?.count ?? 0;
  }

  private mapToTodo(row: DbTodo): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      status: row.status,
      priority: row.priority,
      dueDate: row.dueDate,
      tags: row.tags ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt,
    };
  }
}
