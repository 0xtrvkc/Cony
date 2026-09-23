# Cony

A mobile-first meme collection. Upload multiple images, keep the original bytes and formats, flag or categorize memes, search categories, and select several for bulk actions. Its colors change on every visit. Data is stored in each visitor's browser using IndexedDB.

## Publish on GitHub Pages

1. Upload `index.html` and `config.js` to the root of your repository.
2. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select the main branch and `/ (root)`, then save.
3. Open the HTTPS URL GitHub Pages gives you.

Anyone with the URL can use Cony. Each person's browser collection is separate. Local browser data can be lost if someone clears site storage, so use Drive backup for durable copies.

## Enable Google Drive for everyone

1. In Google Cloud Console, create a project and enable the **Google Drive API**.
2. Configure the OAuth consent screen. If you leave it in *Testing*, explicitly add your friends as test users; for wider use, publish the app and complete any Google verification that applies to the requested Drive scope.
3. Create an OAuth client of type **Web application**. Under **Authorized JavaScript origins**, add the exact GitHub Pages origin, such as `https://YOUR_USERNAME.github.io` (no repository path). No client secret belongs in this site.
4. Copy the **client ID** into `config.js` and commit that updated file. The client ID is public configuration. Never commit a client secret.
5. Visitors open Cony, tap ☁, tap **Connect Google**, and grant permission. Each Google account sees and owns its own `Cony` folder in its own Drive. They can use **Back up to Drive** and **Restore from Drive** on their devices.

The app requests `drive.file` access. Drive backup keeps the original image file bytes plus a JSON manifest for categories and flags. Restore merges images by ID. Deleting a meme in Cony removes the local copy; it deliberately does not delete its Drive backup. Google connections require HTTPS and an authorized origin; opening `index.html` from a local file supports local features only.

The app loads Google Identity Services from Google only when Connect Google is tapped. It uses no other remote assets.
