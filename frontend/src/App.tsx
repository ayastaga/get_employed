import Form from "@/components/Form"
import {ThemeProvider} from "@/components/theme-provider"
//import Map from "@/components/JobMap"
//import Random from "@/components/Random"

function App() {
  return (

    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {/* 
      <div className="justify-items-center my-5">
        <Navbar/>
      </div>
      */}
      <div className="mt-5 justify-items-center">
        <Form />
      </div>
    </ThemeProvider>
  )
}

export default App

