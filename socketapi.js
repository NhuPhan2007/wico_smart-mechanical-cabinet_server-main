const option = {
    allowEIO3: true,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true,
    },
}
const io = require("socket.io")(option);

const Matrix = require('./matrix.js');
let matrix = Matrix.matrix;
let posOfThing = "";

const db = require('./db.js');



const socketapi = {
    io: io
}

io.on("connection", (socket) => {
    console.log("[INFO] new connection: [" + socket.id + "]",
        socket.request.connection.remoteAddress);

    socket.on("/esp/new-card-found", (data) => {
        console.log("[/esp/new-card-found] from [" + socket.id + "]:", data);
        let { id, uid, floor } = data;
        // floor = 1 ? id = id : id = id + 15;
        console.log(Matrix.updateUID(id, uid, matrix));
        if (Matrix.checkItem(Matrix.getItemName(uid), matrix)) {
            socket.broadcast.emit("/web/new-card-found", matrix);
        }
    })

    socket.on("/esp/got-person", (data) => {
        console.log("[/esp/got-person] from [" + socket.id + "]:", data);
        let person = db.find((item) => item.uid == data.uid);
        if (person) {
            console.log("found");
            //send to all client (esp will handle this to open door)
            io.emit("/web/got-person", person);
        }
        else {
            console.log("new person");
            socket.broadcast.emit("/web/new-person", data.uid); //send uid to web to create new person
        }
    })

    socket.on("/esp/pos-of-thing", (data) => {
        console.log("[/esp/pos-of-thing] from [" + socket.id + "]:", data);
        let msg = "";
        if (posOfThing == "" || posOfThing != data.posOfThing) {
            msg = data.posOfThing;
            posOfThing = data.posOfThing;
            Matrix.updateThing(msg, matrix) ? console.log("update success") : console.log("update fail");
            socket.broadcast.emit("/web/pos-of-thing", matrix);
        }
    })

    socket.on("/web/new-person", (data) => {
        console.log("[/web/new-person] from [" + socket.id + "]:", data);
        db.push(data);
        socket.broadcast.emit("/web/new-person-done", data);
        //send back to esp to open door after create new person
        socket.broadcast.emit("/web/got-person", data);
    })

    socket.on("/web/get-data", () => {
        console.log("[/web/get-data] from [" + socket.id + "]");
        socket.emit("/web/get-data-done", matrix);
    });

    socket.on("/web/lock-door", (data) => {
        console.log("[/web/lock-door] from [" + socket.id + "]");
        io.emit("/web/lock-door", data);
    });


    socket.on("message", (data) => {
        console.log(`[message] from ${data.clientID} via socket id: ${socket.id}`);
        socket.broadcast.emit("message", data);
    })
    /**************************** */
    //xu ly chung
    socket.on("reconnect", function () {
        console.log("[" + socket.id + "] reconnect.");
    });
    socket.on("disconnect", () => {
        console.log("[" + socket.id + "] disconnect.");
    });
    socket.on("connect_error", (err) => {
        console.log(err.stack);
    });
})

function getMedianFromArr(arr) {
    return arr.reduce((a, b) => +a + +b, 0) / arr.length;
}

module.exports = socketapi;