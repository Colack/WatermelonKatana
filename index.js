/**
 * WatermelonKatana Entry Point
 */

/**
 * Module Dependencies
*/
const express = require('express');
const cookieParser = require('cookie-parser');

/**
 * Internal Dependencies
 */
const connectDB = require('./db/connect'); // Connect to MongoDB
const Users = require('./db/model/Users'); // User Model
const Projects = require('./db/model/Projects'); // Project Model
const Posts = require('./db/model/Posts'); // Post Model
const { userAuth, adminAuth, checkAuth } = require('./middleware/auth'); // Auth Middleware
const { Turbo } = require('./public/turbo/index'); // Turbowarp
const { openNotification } = require('./api/Auth/auth'); // Notification
const { openReport } = require('./api/Admin/admin');
const makeLiteralChars = require('./util/js/makeLiteralChars');
const censored = require('./util/js/censored');
const logger = require('./util/js/logger');

/**
 * Constants
 */
const PORT = process.env.PORT || 3000;
const app = express();
const turbo = new Turbo(app, express.static('./public/turbo'))
const cldir = __dirname + "/public/html";
const bigPaths = new RegExp(`^/datablock_storage/[^/]+/(${["populate_key_values", "populate_tables"].join("|")})`);

/**
 * Connect to MongoDB
 */
connectDB();

/**
 * Middleware Setup
 */
app.use((req, res, next) => {
    const maxSize = req.path.match(bigPaths) !== null ? "10mb": "100kb";
    express.json({limit: maxSize})(req, res, next);
});
app.use(cookieParser());

/**
 * Server Static Files from the Public Directory
 */
app.use(express.static(__dirname + '/public'));

/**
 * Define API Routes
 */
app.use("/api/auth", require("./api/Auth/route")); // Authentication routes
app.use("/api/project", require("./api/Project/route")); // Project routes
app.use("/api/forum", require("./api/Forum/route")); // Project routes
app.use("/api/media", require("./api/Media/route")); // Media routes
app.use("/api/admin", require("./api/Admin/route")); // Admin command routes

/**
 * Route Handlers for HTML
 */
app.get("/", (req, res) => res.sendFile(cldir + "/home.html")); // Home page
app.get("/register", (req, res) => res.sendFile(cldir + "/users/auth/register.html")); // Registration page
app.get("/login", (req, res) => res.sendFile(cldir + "/users/auth/login.html")); // Login page
app.get("/gamejams", (req, res) => res.sendFile(cldir + "/projects/gamejams.html")); // game jam page
app.get("/search", (req, res) => res.sendFile(cldir + "/projects/search.html")); // Search page
app.get("/publish", userAuth, (req, res) => res.sendFile(cldir + "/projects/publish.html")); // Publish page, users only
app.get("/chat", userAuth, (req, res) => res.sendFile(cldir + "/chat.html"));
app.get("/admin", adminAuth, (req, res) => res.sendFile(cldir + "/users/admin.html"));
app.get("/userlist", userAuth, (req, res) => res.sendFile(cldir + "/users/list.html"));
app.get("/uploadedmedia", (req, res) => res.sendFile(cldir + "/media.html"));
app.get("/authors", (req, res) => { res.sendFile(cldir + "/authors.html") });
app.get("/updates", (req, res) => res.sendFile(cldir + "/updates.html"));
app.get("/forum", (req, res) => res.sendFile(cldir + "/forum/home.html")); // Forum Home/Search
app.get("/forum/post", userAuth, (req, res) => res.sendFile(cldir + "/forum/publish.html")); // Publish page, users only
app.get("/project/:id/delete", userAuth, (req, res) => res.redirect("/api/project/delete/" + req.params.id)); // Delete project route, users only
app.get("/forum/discussion/:id/delete", userAuth, (req, res) => res.redirect("/api/forum/delete/" + req.params.id)); // Delete post route, users only
app.get("/profile/edit", userAuth, (req, res) => res.sendFile(cldir + "/users/profile/edit.html"));
app.get("/profile/chpass", userAuth, (req, res) => res.sendFile(cldir + "/users/profile/chpass.html"));
app.get("/profile/verify", (req, res) => res.sendFile(cldir + "/users/profile/verification.html"));
app.get("/verified", (req, res) => res.sendFile(cldir + "/users/profile/verified.html"));
app.get("/resetpass/email", (req, res) => res.sendFile(cldir + "/users/profile/emailresetpass.html"));
app.get("/resetpass", (req, res) => res.sendFile(cldir + "/users/profile/resetpass.html"));
app.get("/verified", (req, res) => res.sendFile(cldir + "/users/profile/verified.html"));
app.get("/api", (req, res) => res.sendFile(cldir + "/api.txt"));
app.use("/api", (req, res) => res.status(404).json({ error:"Error: API Not Found", message:"404 Error. This API does not exist, check /api for a list of supported APIs" }));
app.use((req, res) => res.status(404).sendFile(cldir + "/404.html"));

/**
 * Other Route Handlers
 */
app.get("/notification/:index", userAuth, openNotification);
app.get("/report/:id", adminAuth, openReport);
app.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" });
    res.redirect("/");
});
app.get("/project/:id", checkAuth, async (req, res) => {
    // Project page with dynamic project ID
    var proj = await Projects.findOne({ _id: req.params.id });
    if (!proj) return res.status(404).sendFile(cldir + "/404.html");
    var tok = res.locals.userToken;
    if (proj.mature) {
      if (!tok) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
      var user = await Users.findOne({ _id: tok.id });
      if (!user || !user.mature) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
    }
    if (tok && !proj.viewers.includes(tok.id)) proj.viewers.push(tok.id);
    proj.views++;
    sendFileReplace(res, "./Pages/projects/project.html", (s) => s.replace("<!--og:meta-->",`
      <meta property="og:title" content="${makeLiteralChars(proj.title)}"/>
      <meta property="og:type" content="website"/>
      <meta property="og:image" content="${proj.thumbnail}"/>
      <meta property="og:description" content="${makeLiteralChars(proj.content)} \n By: ${proj.poster} \n Score: ${proj.score} Views: ${proj.views}"/>
    `).replace("<!--content-->",`
      ${makeLiteralChars(proj.title)}<br>
      By: ${proj.poster}<br>
      ${makeLiteralChars(proj.content)}<br>
      <a href="${proj.link}">${proj.link}</a><br>
      ${proj.tags.map(v=>"#"+v).join(", ")}<br>
      Score: ${proj.score} Views: ${proj.views} Platform: ${proj.platform} Featured: ${proj.featured}
    `).replace("<!--title-->",`
      <title>${makeLiteralChars(proj.title)} | WatermelonKatana</title>
    `));
    await proj.save();
  });
  app.get("/project/:id/edit", userAuth, async (req, res) => {
    const project = await Projects.findOne({ _id: req.params.id });
    const tok = res.locals.userToken;
    if (!tok || (project.posterId !== tok.id && tok.role !== "Admin")) 
      return res.status(403).sendFile(__dirname+"/Middleware/403.html");
    res.sendFile(cldir + "/projects/edit.html");
  }); // Edit project page, users only
  app.get("/forum/discussion/:id", checkAuth, async (req, res) => {
    var post = await Posts.findOne({ _id: req.params.id });
    if (!post) return res.status(404).sendFile(cldir + "/404.html");
    var tok = res.locals.userToken;
    if (post.mature) {
      if (!tok) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
      var user = await Users.findOne({ _id: tok.id });
      if (!user || !user.mature) return res.status(403).sendFile(__dirname+"/Middleware/403.html");
    }
    if (tok && !post.viewers.includes(tok.id)) post.viewers.push(tok.id);
    post.views++;
    sendFileReplace(res, "./Pages/forum/discussion.html", (s) => s.replace("<!--og:meta-->",`
      <meta property="og:title" content="${makeLiteralChars(post.title)}"/>
      <meta property="og:type" content="website"/>
      <meta property="og:description" content="${makeLiteralChars(post.content)} \n By: ${post.poster} \n Views: ${post.views}"/>
    `).replace("<!--content-->",`
      ${makeLiteralChars(post.title)}<br>
      By: ${post.poster}<br>
      ${makeLiteralChars(post.content)}<br>
      ${post.tags.map(v=>"#"+v).join(", ")}<br>
      Views: ${post.views} Featured: ${post.featured}
    `).replace("<!--title-->",`
      <title>${makeLiteralChars(post.title)} | WatermelonKatana Forum</title>
    `));
    await post.save();
  });
  app.get("/forum/discussion/:id/edit", userAuth, async (req, res) => {
    const post = await Posts.findOne({ _id: req.params.id });
    const tok = res.locals.userToken;
    if (!tok || (post.posterId !== tok.id && tok.role !== "Admin")) 
      return res.status(403).sendFile(__dirname+"/Middleware/403.html");
    res.sendFile(cldir + "/forum/edit.html");
  }); // Edit post page, users only
  
  // User profile page with dynamic user name
  app.get("/user/:name", async (req, res) => {
    var user = await Users.findOne({ username: req.params.name });
    if (!user) {
      res.status(404).sendFile(cldir + "/404.html");
      return;
    }
    sendFileReplace(res, "./Pages/users/user.html", (s) => s.replace("<!--og:meta-->",`
      <meta property="og:title" content="@${user.username} on WatermelonKatana"/>
      <meta property="og:type" content="website"/>
      <meta property="og:image" content="${user.avatar}"/>
      <meta property="og:description" content="${makeLiteralChars(user.biography)}"/>
    `).replace("<!--content-->",`
      ${user.username}<br>
      ${makeLiteralChars(user.biography)}<br>
      ${user.badges.join(", ")}<br>
      Role: ${user.role}
    `).replace("<!--title-->",`
      <title>${user.username} | WatermelonKatana</title>
    `));
  });
  
  
  app.get('/sitemap.xml', async (req, res) => {
    const projects = await Projects.find({ hidden: false });
    const posts = await Posts.find({ hidden: false });
    const users = await Users.find({});
  
    var dynamics = `
    ${projects.map((e) => `
     <url>
      <loc>https://watermelonkatana.com/project/${e.id}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
     </url>
    `).join('\n')}
    ${posts.map((e) => `
     <url>
      <loc>https://watermelonkatana.com/forum/discussion/${e.id}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
     </url>
    `).join('\n')}
    ${users.map((e) => `
     <url>
      <loc>https://watermelonkatana.com/user/${e.username}/</loc>
      <changefreq>monthly</changefreq>
      <priority>0.4</priority>
     </url>`).join('\n')}`;
    res.set('Content-Type', 'application/xml');
    sendFileReplace(res, './Pages/sitemap.xml', (s) => s.replace('<!--dynamics-->', dynamics), true);
  })

/**
 * Start the Server
 */
const server = app.listen(PORT, () => {
    console.log(logger.logInfo(`Server running on port ${PORT}`));
});

/**
 * Server Setup
 */
server.setTimeout(30000);

/**
 * Server Functions
 */
process.on('unhandledRejection', (err) => {
    console.log(logger.logError(`Unhandled Rejection: ${err.message}`));
    process.exit(1);
});