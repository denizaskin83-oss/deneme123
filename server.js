const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;
const MAP_W = 1280;
const MAP_H = 960;
const players = new Map();
const world = {
  isNight: false,
  collectedStars: Object.create(null)
};

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'Peniontale_Multiplayer.html')));

function clamp(v, min, max){ return Math.max(min, Math.min(max, Number(v) || 0)); }
function cleanName(v){
  const n = String(v || 'Oyuncu').replace(/[<>]/g,'').trim().slice(0,18);
  return n || 'Oyuncu';
}
function publicPlayer(p){
  return { id:p.id, name:p.name, x:p.x, y:p.y, facing:p.facing };
}
function broadcastPlayers(){
  io.emit('world:players', [...players.values()].map(publicPlayer));
}

io.on('connection', socket => {
  socket.on('player:join', data => {
    if(players.has(socket.id)) return;
    const p = {
      id: socket.id,
      name: cleanName(data?.name),
      x: clamp(data?.x, 40, MAP_W - 82),
      y: clamp(data?.y, 40, MAP_H - 100),
      facing: ['up','down','left','right'].includes(data?.facing) ? data.facing : 'down'
    };
    players.set(socket.id, p);

    socket.emit('world:init', {
      you: socket.id,
      players: [...players.values()].map(publicPlayer),
      isNight: world.isNight,
      collectedStars: world.collectedStars
    });
    socket.broadcast.emit('player:joined', publicPlayer(p));
    broadcastPlayers();
  });

  socket.on('player:move', data => {
    const p=players.get(socket.id);
    if(!p) return;
    p.x=clamp(data?.x,40,MAP_W-82);
    p.y=clamp(data?.y,40,MAP_H-100);
    if(['up','down','left','right'].includes(data?.facing)) p.facing=data.facing;
    socket.broadcast.emit('player:moved', publicPlayer(p));
  });

  socket.on('player:action', data => {
    const p=players.get(socket.id);
    if(!p) return;
    const text=String(data?.text || '').replace(/[<>]/g,'').slice(0,32);
    if(text) io.emit('world:playerAction',{id:p.id,name:p.name,text});
  });

  socket.on('world:toggleNight', () => {
    if(!players.has(socket.id)) return;
    world.isNight=!world.isNight;
    io.emit('world:night',{isNight:world.isNight,by:socket.id});
  });

  socket.on('world:collectStar', data => {
    if(!players.has(socket.id)) return;
    const id=String(data?.starId || '');
    if(!['1','2','3'].includes(id)) return;
    if(world.collectedStars[id]) return;
    world.collectedStars[id]=true;
    io.emit('world:star',{starId:id,by:socket.id});
  });

  socket.on('disconnect', () => {
    if(players.delete(socket.id)) {
      socket.broadcast.emit('player:left',{id:socket.id});
      broadcastPlayers();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Peniontale multiplayer server: http://localhost:${PORT}`);
});
