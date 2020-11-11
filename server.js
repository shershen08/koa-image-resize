const fs = require('fs');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const multer = require('@koa/multer');
const serve = require('koa-static');
const sharp = require('sharp');

const upload = multer();
const router = new Router();
const app = new Koa();

app.use(bodyParser({
  formLimit:'500kb'
}));
// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(serve(__dirname + '/resize'));
  
router.get('/', (ctx, next) => {
  ctx.body = 'Hello World';
});

router.post('/', upload.fields([
  {
    name: 'avatar',
    maxCount: 1
  }
]), (ctx, next) => {

  const fileName = Date.now() + '.png';

  const file = ctx.request.files.avatar[0];

  if(file.size > 0.5e5) {
    ctx.throw(400,'File too big');
  }

  sharp(file.buffer)
  .resize(320, 240)
  .toFile('./resize/'+ fileName, (err, info) => { 
      console.log(err, info)
      next()
   });

  ctx.body = 'File saved: ' + fileName;
});


const writeTmpFile = () => {
  fs.writeFile('./tmp/'+ Date.now() + '.png', ctx.request.files.avatar, (err) => {
    if (err) throw err;
    console.log('file saved!');
  });
}

app
  .use(router.routes())
  .use(router.allowedMethods());




module.exports = {
  run: function(){
    app.listen(3000, () => console.log('server started 3000'))
  },
  stop: function(){
    process.exit(1)
  }
}

if (!module.parent) {
  app.listen(3000, () => console.log('server started 3000'))
}