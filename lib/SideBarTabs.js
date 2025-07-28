import {
    Home,
    ShoppingCart,
    Boxes,
    UserRound,
    Box,
  } from "lucide-react";

const tabs =[
    { label: 'Dashboard', path: '/dashboard',icon:<Home /> },
    { label: 'Customers', path: '/dashboard/customers',icon:<UserRound />},
    { label: 'Products', path: '/dashboard/products', icon:<Box/>},
    { label: 'Categories', path: '/dashboard/categories', icon:<Boxes/>},
    { label: 'Orders', path: '/dashboard/orders' ,icon:<ShoppingCart />},
]

export default tabs;