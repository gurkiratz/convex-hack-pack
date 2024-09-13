import React, { useState } from 'react'
import { Input } from './ui/input'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { TodoType } from 'convex/schema'
import { FiTrash2 } from 'react-icons/fi'
import {
  SignInButton,
  useAuth,
} from '@clerk/clerk-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const TodoContainer = () => {
  const { isLoading, isAuthenticated } = useCurrentUser()

  const [newTodo, setNewTodo] = useState('')
  const addTodo = useMutation(api.todoFunctions.addTodo)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    await addTodo({
      title: newTodo.trim(),
      status: 'todo',
      updatedTime: Date.now(),
    })
    setNewTodo('')
  }

  const handleInputChange = (newTodo: string) => {
    setNewTodo(newTodo)
  }

  return (
    <div className="flex flex-col gap-4 container">
      <div className=''>
        <h1 className="text-center text-xl">
          {new Date().toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
          })}
          {', '}
          {new Date().toLocaleDateString('en', {
            weekday: 'long',
          })}
        </h1>
        <h2 className="text-center font-semibold text-lg">
          {new Date().toLocaleTimeString('en', {
            timeStyle: 'short',
          })}
        </h2>
      </div>
      <div className="mb-2">
        <AddTodo
          newTodo={newTodo}
          addTodo={handleAddTodo}
          handleInputChange={handleInputChange}
        />
      </div>
      {isLoading ? <p>Loading...</p> : !isAuthenticated ? (
        <SignInButton />
      ) : (
        <>
          <TodoList />
        </>
      )}
    </div>
  )
}

const TodoList = () => {
  const [isUpdating, setIsUpdating] = useState(false)

  const removeTodo = useMutation(api.todoFunctions.deleteTodo)
  const updateTodo = useMutation(api.todoFunctions.updateTodo)

  const todos = useQuery(api.todoFunctions.listTodos, {})
    ?.sort((a, b) => b._creationTime - a._creationTime)
    .sort((a, b) => {
      if (a.status === 'todo' && b.status !== 'todo') return -1
      if (a.status !== 'todo' && b.status === 'todo') return 1
      return 0
    })

  const handleTodoUpdate = async (document: TodoType) => {
    setIsUpdating(true)
    const newStatus = document.status === 'done' ? 'todo' : 'done'
    const updatedTime = Date.now()

    await updateTodo({
      id: document._id,
      status: newStatus,
      updatedTime,
    })
    setIsUpdating(false)
  }

  return (
    <ul className="border rounded-md divide-y-2">
      {todos?.map((document) => {
        return (
          <li
            key={document._id}
            className="flex justify-between items-center px-2 py-1 bg-gray-800/10 hover:bg-gray-800/20"
          >
            <p className="space-x-2">
              {isUpdating ? (
                <Checkbox
                  checked={document.status === 'done'}
                  onChange={() => handleTodoUpdate(document)}
                />
              ) : (
                <Checkbox
                  checked={document.status === 'done'}
                  onCheckedChange={() => handleTodoUpdate(document)}
                />
              )}

              <span
                className={`${document.status === 'done' ? 'text-gray-500 line-through opacity-80' : ''}`}
              >
                {document.title}
              </span>
            </p>
            <Button
              onClick={() => removeTodo({ id: document._id })}
              variant={'ghost'}
              size={'sm'}
              className="rounded bg-red-300/20 px-1.5 py-1 text-xs text-red-300 transition-colors hover:bg-red-600 hover:text-red-200"
            >
              <FiTrash2 />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

const AddTodo = ({
  newTodo,
  addTodo,
  handleInputChange,
}: {
  newTodo: string
  addTodo: (e: React.FormEvent) => Promise<void>
  handleInputChange: (newTodo: string) => void
}) => {
  return (
    <form className="flex gap-2">
      <Input
        type="text"
        value={newTodo}
        onChange={(event) => handleInputChange(event.target.value)}
        placeholder="Add your tasks for the day"
      />
      <Button
        type="submit"
        disabled={!newTodo}
        title={
          newTodo
            ? 'Save your todo to the database'
            : 'You must enter a todo first'
        }
        onClick={(e) => addTodo(e)}
        className="min-w-fit"
      >
        Save todo
      </Button>
    </form>
  )
}

export default TodoContainer
