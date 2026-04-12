import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realTimeService } from "../main";


interface SocketContextType{
    socket : Socket | null
}

const SocketContext = createContext<SocketContextType>({socket : null});

export const SocketProvider = ({children}:{children:ReactNode})=>{
    const {isAuth}=useAppData();
    const socketRef = useRef<Socket|null>(null);
    useEffect(()=>{
        if(!isAuth){
            socketRef.current?.disconnect();
            socketRef.current=null;
            return;
        }
        if(socketRef.current) return;

        const socket = io(realTimeService,{
            auth:{
                token: localStorage.getItem("token"),
            },
            transports: ["websocket"],
        })
        socketRef.current = socket; 
        socket.on("connect",()=>{
            console.log("Socket connected",socket.id);
        })
        socket.on("disconnect",()=>{
            console.log("Socket disconnected",socket.id);
        })
        socket.on("connect_error",(error)=>{
            console.log("Socket error",error.message);
        })

        return ()=>{
            socket.disconnect();
            socketRef.current=null;
        }
    },[isAuth]);

    return <SocketContext.Provider value={{socket:socketRef.current}}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = ()=>useContext(SocketContext);