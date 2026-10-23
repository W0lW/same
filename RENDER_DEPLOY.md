# Deploy SAME WAVELENGTH on Render

The game uses a long-running Node.js server for room state and Server-Sent Events. Deploy the frontend and backend together as one Render web service; the in-memory room store is not reliable on serverless Vercel functions.

## Steps

1. Sign in to Render at https://render.com/.
2. Open the Render Dashboard and choose **New** → **Blueprint**.
3. Connect the GitHub repository `W0lW/same` (authorize access if prompted).
4. Render will read `render.yaml` and show the `same-wavelength` web service.
5. Choose **Apply** / **Deploy Blueprint** and wait for the first deployment to finish.
6. Open the generated `https://same-wavelength-....onrender.com` URL. The exact URL is assigned by Render.
7. Test multiplayer with two separate browser sessions/devices: create a room in one, join with its code in the other.

## Notes

- No Firebase project or secret key is required for this setup.
- The free Render service may sleep when idle. The first request after inactivity can take a while to wake up.
- The Vercel frontend URL is not automatically converted to use the Render backend. For multiplayer testing, open the Render URL on both devices so frontend and API use the same origin.
- If the first deployment fails, open the service's **Logs** in Render and inspect the build/start error before changing settings.
