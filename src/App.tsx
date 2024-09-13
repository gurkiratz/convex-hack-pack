import MyTodoList from './components/Todo'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <main className="container md:border-l md:border-r max-w-2xl flex flex-col items-center gap-8">
    <Navbar />
    <hr className='text-white w-full absolute top-10' />
        {/* <h1 className="text-4xl font-extrabold mt-8 text-center">
          Your Todo List
        </h1> */}

        <MyTodoList />
        <footer className="text-center text-xs mb-5 mt-10 w-full">
        <p>
          Built with <a href="https://convex.dev">Convex</a>,{' '}
          <a href="https://www.typescriptlang.org">TypeScript</a>,{' '}
          <a href="https://react.dev">React</a>, and{' '}
          <a href="https://vitejs.dev">Vite</a>
        </p>
        <p>
          Random app ideas thanks to{' '}
          <a target="_blank" href="https://appideagenerator.com/">
            appideagenerator.com
          </a>
        </p>
      </footer>
      </main>
      {/* <VanishList /> */}
      {/* <CustomKanban /> */}
      
    </>
  )
}

export default App
