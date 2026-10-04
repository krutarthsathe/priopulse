# PrioPulse

PrioPulse is a web application built with Next.js and React.

## Requirements

Install Node.js 22 LTS and npm before starting. npm is included with Node.js.

Check that both are installed:

```bash
node --version
npm --version
```

## Start the project locally

1. Open Terminal and go to your project folder:

   ```bash
   cd /Users/krutarthsathe/Documents/krutarth-sathe/industry-hackathon/priopulse
   ```

   If you saved the project somewhere else, use that folder's path instead.

2. Install the project dependencies:

   ```bash
   npm ci
   ```

   Wait for the installation to finish. You only need to repeat this step when dependencies change or after downloading a fresh copy of the project.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. If Terminal shows a different port, open the address shown there.

Keep Terminal open while using the application. Saved code changes appear automatically in the browser. Press **Control + C** in Terminal to stop the server.

## Run a production build locally

Build the application first:

```bash
npm run build
```

After the build succeeds, start it:

```bash
npm start
```

Open the local address shown in Terminal. Rebuild after changing code to see those changes in production mode.

## Common startup issues

- **Node.js or npm command not found:** Install Node.js and reopen Terminal.
- **Missing dependencies:** Run `npm ci` from the project folder.
- **Port 3000 is already in use:** Use the address printed by the development server, or run `npm run dev -- --port 3001` and open `http://localhost:3001`.
- **The server stops with an error:** Read the error in Terminal and resolve it before restarting.
