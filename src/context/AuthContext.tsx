import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, loginWithGoogle, logoutUser, onAuthStateChanged, User, ADMIN_EMAIL } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  userId:string; email:string; displayName:string; role:'athlete'|'coach'|'admin'; photoURL?:string;
  createdAt?:unknown; updatedAt?:unknown;
}
interface AuthContextType {
  currentUser:User|null; profile:UserProfile|null; loading:boolean; isAdmin:boolean; isCoach:boolean;
  signInWithGoogle:()=>Promise<void>; signOut:()=>Promise<void>;
}
const AuthContext=createContext<AuthContextType>({
  currentUser:null,profile:null,loading:true,isAdmin:false,isCoach:false,signInWithGoogle:async()=>{},signOut:async()=>{}
});
export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [currentUser,setCurrentUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<UserProfile|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let unsubProfile:(()=>void)|null=null;
    const unsubAuth=onAuthStateChanged(auth,user=>{
      setCurrentUser(user);
      if(unsubProfile){unsubProfile();unsubProfile=null;}
      if(!user){setProfile(null);setLoading(false);return;}
      setLoading(true);
      unsubProfile=onSnapshot(doc(db,'users',user.uid),snap=>{
        setProfile(snap.exists()?snap.data() as UserProfile:{
          userId:user.uid,email:user.email||'',displayName:user.displayName||'Utente GROW UP',role:'athlete',photoURL:user.photoURL||''
        });
        setLoading(false);
      },err=>{console.error('Profile subscription failed',err);setLoading(false);});
    });
    return()=>{unsubAuth();if(unsubProfile)unsubProfile();};
  },[]);
  const isAdmin=useMemo(()=>Boolean(currentUser?.email?.trim().toLowerCase()===ADMIN_EMAIL.toLowerCase()),[currentUser]);
  const isCoach=profile?.role==='coach';
  return <AuthContext.Provider value={{currentUser,profile,loading,isAdmin,isCoach,signInWithGoogle:async()=>{await loginWithGoogle();},signOut:logoutUser}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);
