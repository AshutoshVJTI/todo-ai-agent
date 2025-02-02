import { db } from './db/index.js';
import { todosTable } from './db/schema.js';
import { ilike, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getAllTodos() {
    const todos = await db.select().from(todosTable);
    return todos;
}

async function createTodo(todo) {
    const [result] = await db
    .insert(todosTable)
    .values({ todo })
    .returning({ id: todosTable.id });
    return result;
}

async function deleteTodoById(id) {
    await db.delete(todosTable).where(eq(todosTable.id, id));
}

async function searchTodo(search) {
    const todos = await db
        .select()
        .from(todosTable)
        .where(ilike(todosTable.todo, `%${search}%`));
    return todos;
}

const tools = {
    getAllTodos: getAllTodos,
    createTodo: createTodo,
    deleteTodoById: deleteTodoById,
    searchTodo: searchTodo,
}

const SYSTEM_PROMPT = `

You are an AI To-do list assistant with START, PLAN, ACTION, Observation, and Output State.
Wait for the user prompt and first PLAN using available tools.
After planning, take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, return the AI response based on START prompt and observations.

**IMPORTANT:** Always respond in JSON format with the following structure:
- "type": Indicates the message type (plan, action, observation, output).
- "plan": If planning, describe your plan here.
- "function": If taking action, specify the function name.
- "input": If taking action, provide input parameters for the function.
- "observation": Include the observation after an action.
- "output": Provide the final output to the user.

Todo DB Schema:
id: Int and Primary Key
todo: String
created_at: Date Time
updated_at: Date Time

Available tools:
- getAllTodos(): Returns all the Todos from Database.
- createTodo(todo: string): Creates a new Todo in the DB and takes todo as a string and returns the id of the created todo.
- deleteTodoById(id: string): Deletes a Todo from the DB and takes id as a number.
- searchTodo(search: string): Searches a Todo from the DB and takes search as a string.

Example (in JSON format):
{"type": "user", "user": "Add a task for shopping groceries."}
{"type": "plan", "plan": "I will try to get more context on what user needs to shop."}
{"type": "output", "output": "What do you want to shop?"}
{"type": "user", "user": "I want to shop for milk and eggs."}
{"type": "action", "function": "createTodo", "input": "Shopping groceries for milk and eggs."}
{"type": "observation", "observation": "2"}
{"type": "output", "output": "Your todo has been added successfully."}
`;


const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

while (true) {
    const query = readlineSync.question('>>');
    const userMessage = { "type": "user", "user": query };
    messages.push({ role: 'user', content: JSON.stringify(userMessage) });

    while (true) {
        const chat = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            response_format: { type: 'json_object' },
        });

        const result = chat.choices[0].message.content;
        messages.push({ role: 'assistant', content: result });

        const action = JSON.parse(result);

        if (action.type === 'output') {
            console.log(action.output);
            break;
        } else if (action.type === 'plan') {
            console.log(action.plan);
        } else if (action.type === 'observation') {
            console.log(action.observation);
        } else if (action.type === 'action') {
            const fn = tools[action.function];
            if (!fn) throw new Error('Invalid Tool Call');
            const observation = await fn(action.input);
            const observationMessage = { "type": "observation", "observation": observation };
            messages.push({ role: 'developer', content: JSON.stringify(observationMessage) });
        }
    }
}