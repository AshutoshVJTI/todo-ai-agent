import { integer, pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';

export const todosTable = pgTable('todos', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    todo: text('todo').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});
