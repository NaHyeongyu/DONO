'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'

// Note: This is a simplified type. In a real app, you'd want a more robust type definition.
type Todo = {
  id: number;
  task: string;
  is_complete: boolean;
};

export default function TodoList({ initialTodos, user }: { initialTodos: Todo[], user: User }) {
  const supabase = createClient()
  const [todos, setTodos] = useState(initialTodos)
  const [newTask, setNewTask] = useState('')

  const handleAddTask = async () => {
    if (newTask.trim() === '') return

    const { data, error } = await supabase
      .from('todos')
      .insert({ task: newTask, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
    } else if (data) {
      setTodos([...todos, data])
      setNewTask('')
    }
  }

  const handleToggleComplete = async (id: number, is_complete: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !is_complete })
      .eq('id', id)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_complete: !is_complete } : todo
        )
      )
    }
  }

  const handleDeleteTask = async (id: number) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting task:', error)
    } else {
      setTodos(todos.filter((todo) => todo.id !== id))
    }
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // This will trigger a re-render on the server component and show the AuthForm
    window.location.reload();
  }

  return (
    <div className="w-full max-w-2xl p-8 mx-auto mt-10 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Todo List</h1>
            <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Logout
            </button>
        </div>
        <div className="flex gap-2 mb-6">
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={handleAddTask}
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Add
            </button>
        </div>
        <ul>
            {todos.map((todo) => (
                <li
                    key={todo.id}
                    className="flex items-center justify-between p-4 mb-2 bg-gray-50 rounded-lg shadow-sm"
                >
                    <span
                        className={`flex-grow cursor-pointer ${
                            todo.is_complete ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                        onClick={() => handleToggleComplete(todo.id, todo.is_complete)}
                    >
                        {todo.task}
                    </span>
                    <button
                        onClick={() => handleDeleteTask(todo.id)}
                        className="ml-4 px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none"
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    </div>
  )
}
