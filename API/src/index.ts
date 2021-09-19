import app from "./Server";
import "./brain/train";

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log("Express server started on port: " + port);
});
