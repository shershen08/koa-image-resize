const app = require('./server.js');
app.run();

setTimeout(function(){
    app.stop();
}, 5000)