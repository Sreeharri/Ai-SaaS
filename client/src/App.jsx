import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import DashBoard from './pages/DashBoard.jsx'
import WriteArticle from './pages/WriteArticle.jsx'
import BlogTitles from './pages/BlogTitles.jsx'
import GenerateInages from './pages/GenerateInages.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import Community from './pages/Community.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/ai' element={<Layout/>}> // Nested routes under /ai
          <Route index element={<DashBoard />} /> // Default route for /ai here the ai router is te default and under this there are multile roiuters index for default 
          <Route path='write-article' element={<WriteArticle />} /> 
          <Route path= 'blog-titles' element={<BlogTitles />} />
          <Route path= 'generate-images' element={<GenerateInages />} />
          <Route path= 'remove-background' element={<RemoveBackground />} />
          <Route path = 'remove-object' element={<RemoveObject />} />
          <Route path = 'review-resume' element={<ReviewResume />} />
          <Route path = 'community' element={<Community />} />
        </Route>
      </Routes>
      
    </div>
  )
}

export default App
