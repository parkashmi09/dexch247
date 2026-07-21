import { Outlet } from 'react-router-dom'
import Layout from './Layout'

const CasinoLayout = () => {
  return (
    <Layout title="Casino - Diamond Admin">
       <Outlet />
    </Layout>
  )
}

export default CasinoLayout
