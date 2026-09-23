# Cony 🐶

Cony is a mobile-first meme container. Open it at **https://0xtrvkc.github.io/Cony/**.

Add several images from your gallery, make your own categories, search categories, flag favorites, and select multiple memes to categorize, flag, or delete. The palette changes each time you open the app. Uploaded images retain their original file bytes and format: a PNG stays a PNG.

## Where your memes go

Cony saves memes in **your browser on your device**. Your friends' collections are separate from yours. Clearing browser site data, using private browsing, or changing devices can remove or hide local memes. Google Drive backup is optional and manual: tap **☁ → Connect Google → Back up to Drive**. On another device, connect the **same Google account** and tap **Restore from Drive**. Each person backs up to a `Cony` folder in **their own** Drive account.

Deleting a meme in Cony deletes its local copy. It does not delete a prior Drive backup. The Google connection is for Drive authorization; Cony does not run an account system or automatically sync edits across devices.

## Owner setup: enable Google Drive

The live app currently works locally. To turn on Drive for yourself and friends, configure **one public OAuth client ID**:

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project for Cony.
2. Open [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) in that project and click **Enable**.
3. Go to **Google Auth platform → Branding**. If prompted, click **Get started**. Set the app name to `Cony`, choose a support email, and enter your contact email.
4. In **Audience**, choose **External** so friends with regular Google accounts can connect. For initial testing, leave publishing status at **Testing** and add each friend's Google email under **Test users**. Google limits Testing to 100 test users, and Drive authorization in this mode expires after seven days; users can reconnect. To let anyone with a Google account connect, switch the app to **In production** and follow any verification prompts Google presents.
5. In **Data Access**, add only `https://www.googleapis.com/auth/drive.file`. This gives Cony access to files it creates or the user opens with it, rather than unrestricted Drive access.
6. Go to **Google Auth platform → Clients → Create client**. Choose **Web application**. Under **Authorized JavaScript origins**, enter exactly `https://0xtrvkc.github.io` — no `/Cony/` path and no trailing slash. Cony uses a browser popup callback, so it does not need an authorized redirect URI for its current code. Click **Create** and copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
7. Edit `config.js` in this repo to contain your actual client ID:

   ```js
   window.CONY_GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```

   Commit it and wait for GitHub Pages to update. A **client ID is public** and belongs in this file. **Never commit the client secret** or a downloaded credential JSON.
8. Open [Cony](https://0xtrvkc.github.io/Cony/), tap **☁ → Connect Google**, select your Google account, and approve access. Upload a small test image, tap **Back up to Drive**, then verify the `Cony` folder in that account's Drive. Test restore in a different browser or device signed into the same account.

Friends use the same Cony URL and OAuth client ID, but each chooses **their own Google account**. No friend needs to edit `config.js` or create a Google Cloud project.

### If connection fails

| Message or behavior | Check |
| --- | --- |
| `origin_mismatch` | The Web client must include `https://0xtrvkc.github.io` as an authorized JavaScript origin. |
| `access_denied` while Testing | Add that Google account to **Audience → Test users**. |
| Drive request returns 403 | Enable the **Google Drive API** in the same Cloud project as the client ID, and check the `drive.file` scope. |
| Backup button disabled | Connect Google again. The app keeps its access token only in the current page session. |
| Restored images missing | Confirm you connected the same Google account and previously finished **Back up to Drive**. |

## Repository files

- `index.html` — complete app and pixel chihuahua favicon.
- `config.js` — public Google OAuth client ID configuration.
- `README.md` — these instructions.

Cony is a static GitHub Pages app. Original image files and a JSON manifest are written to Drive only after the user selects **Back up to Drive**. The app does not require a server or a client secret.
