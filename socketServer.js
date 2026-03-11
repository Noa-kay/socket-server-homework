import { Server } from "socket.io";

let id = 1;
let activeClients = 0;

export const createSocket = (httpServer) => {
    const io = new Server(httpServer, {
        // ניתן להוסיף הגדרות נוספות על השרת
        // cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    // כשלקוח מתחבר לשרת
    // socket - נתוני הלקוח שהתחבר כרגע
    io.on('connection', (socket) => {
        // ניתן להוסיף נתונים על היוזר הנוכחי בצורה כזו לסוקט
        socket.userId = id++;
        socket.username = null;
        socket.color = null;
        activeClients += 1;
        console.log(`user ${socket.userId} connected successfully`);

        // שליחת אירוע לקליינט הנוכחי שהתחבר
        // בשם שאנחנו בחרנו
        // הקליינט יקבל את המידע רק אם הוא רשום לאירוע
        socket.emit('user connected', { userId: socket.userId });
        io.emit('active clients updated', { count: activeClients });

        socket.on('update client profile', ({ username, color }) => {
            socket.username = username?.trim() || null;
            socket.color = color || null;
        });

        socket.on('new message', (newMessage) => {
            // שיגור אירוע לכל הלקוחות שמחוברים כרגע
            // io.emit('send message', `new message added by ${socket.userId}: ${newMessage}`)
            io.emit('send message', {
                by: socket.userId,
                username: socket.username || 'unknown',
                color: socket.color || '#000000',
                msg: newMessage
            });
        });

        socket.on('manual disconnect', () => {
            socket.broadcast.emit('client disconnected', {
                username: socket.username || 'unknown',
                color: socket.color || '#000000'
            });
            socket.disconnect();
        });

        socket.on('disconnect', () => {
            activeClients = Math.max(0, activeClients - 1);
            io.emit('active clients updated', { count: activeClients });
        });
    });
};