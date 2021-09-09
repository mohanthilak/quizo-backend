if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
// const cookieParser = require("cookie-parser");
const session = require("express-session");
const User = require("./models/user");
const app = express();
const Messages = require("./models/messages");
const Chat = require("./models/ChatRooms");
const MongoStore = require("connect-mongo");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://quizoo.netlify.app",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const dbUrl =
  "mongodb+srv://admin:BQakMbpwK4ltx3Gt@cluster0.mqwmw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// process.env.DB_URL;
const secret = "ILOVEICECREAM";
// process.env.SECRET;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const userRoutes = require("./routes/user");
const portalsRoutes = require("./routes/portals");
const questionRoutes = require("./routes/questions");
const chatRoomRoutes = require("./routes/chatRoom");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "https://quizoo.netlify.app",
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: dbUrl,
      secret,
      touchAfter: 24 * 60 * 60,
    }),
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpsOnly: false,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 100 * 60 * 60 * 24 * 7,
    },
  })
);

// app.use(cookieParser(secret));

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.use("/", userRoutes);
app.use("/", portalsRoutes);
app.use("/", questionRoutes);
app.use("/", chatRoomRoutes);

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("userConnect", async (userId) => {
    console.log("Got it through socket io", userId);
    let user = await User.findById(userId);
    user.socketId = socket.id;
    await user.save();
    console.log(user);
  });
  socket.on("message", async (data) => {
    // console.log(data);
    const user = await User.findById(data.from);
    const client = await User.findById(data.to);
    const message = new Messages({
      message: data.message,
      from: data.from,
      to: data.to,
    });
    // const textedbefore = await User.findOne({d

    let chat = await Chat.findOne({
      users: { $size: 2, $all: [data.to, data.from] },
    }).populate("messages");
    console.log(chat, "chat");
    if (!chat) {
      chat = new Chat({});
      console.log(chat, "chat inside console.log");
      chat.users.push(data.from);
      chat.users.push(data.to);
      const userRoom = {
        with: data.to,
        room: chat._id,
      };
      const clientRoom = {
        with: data.from,
        room: chat._id,
      };
      user.rooms.push(userRoom);
      client.rooms.push(clientRoom);
    }
    chat.messages.push(message);

    await user.save();
    await client.save();
    await message.save();
    await chat.save();
    console.log(chat);
    if (client.socketId !== "") io.to(client.socketId, { chat });
    socket.emit("received", { chat });
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected: ", socket.id);
    let user = await User.findOneAndUpdate(
      { socketId: socket.id },
      { socketId: "" },
      {
        returnOriginal: false,
      }
    );
    if (user) {
      await user.save();
      console.log(user);
    }
    // console.log("user dissconneted and id updated", user);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`listening at port: ${port}`));
