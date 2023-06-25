import React, { createContext, useContext } from 'react'
import useFirebaseAuth from '../utils/Auth';


// export const AuthContext = createContext({
//     authUser:null,
//     loading:false,
//     FirebaseEmailCreate: async (a, b)=>{},
//     FirebaseEmailSignIn: async (a, b)=>{},
//     FirebaseSignout: async (a, b)=>{},
// })
export const AuthContext = createContext(null);

// const AuthContext = useFirebaseAuth();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const auth = useFirebaseAuth();
    return (
        <AuthContext.Provider value={{ auth }}>
            {children}
        </AuthContext.Provider>
    );
    // const [currentUser, setCurrentUser] = useState(null);

    // useEffect(() => {
    //     auth.onAuthStateChanged(setCurrentUser);
    // }, []);

};

// customize hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);