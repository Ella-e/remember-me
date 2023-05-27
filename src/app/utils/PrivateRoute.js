"use client"
// import { useContext } from "react";
// import { AuthContext } from "./Auth";
// import { Link } from "next/link";
// import { redirect } from "next/navigation";
// // import { Link } from "react-router-dom";

// export default function PrivateRoute({component: RouteComponent, ...rest}) {
//     const {currentUser} = useContext(AuthContext);
//     if(!!currentUser) {
//         redirect('/login')
//     }

//     return(
//         // <Route
//         // {...rest}
//         // render={
//         //     routeProps => !!currentUser ? (<RouteComponent {...routeProps}/>)
//         //         : (<Redirect to={"/login"}/>)
//         // }/>
        
//         <RouteComponent {...routeProps}/>
//         // <Link
//         // {...rest}
//         // render={
//         //     routeProps => !!currentUser ? ( <RouteComponent {...routeProps}/>)
//         //         : (<Link href={"/login"}/>)
//         // }/>
//     )
// }

export default function PrivateRoute() {
    return(<div>ABC</div>)
}