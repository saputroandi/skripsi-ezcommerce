
const fs = require('fs');
const path = require('path');

module.exports = {
  up: async () => {
    // This migration is filesystem-only (no DB changes).
    // It reorganizes legacy files in /uploads into /uploads/proofs and /uploads/thumbnails.

    const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
    const proofsDir = path.join(uploadsRoot, 'proofs');
    const thumbsDir = path.join(uploadsRoot, 'thumbnails');

    if (!fs.existsSync(uploadsRoot)) return;
    if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

    const entries = fs.readdirSync(uploadsRoot, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isFile()) continue;

      const name = ent.name;
      const from = path.join(uploadsRoot, name);

      // Skip dotfiles
      if (name.startsWith('.')) continue;

      // Move known prefixes into their folder
      let to = null;
      if (name.startsWith('proof-')) {
        to = path.join(proofsDir, name);
      } else if (name.startsWith('thumb-')) {
        to = path.join(thumbsDir, name);
      } else {
        // unknown file type: leave it in root
        continue;
      }

      // If destination exists, do not overwrite
      if (fs.existsSync(to)) continue;

      try {
        fs.renameSync(from, to);
      } catch (_) {
        // ignore move errors to keep migration idempotent
      }
    }
  },

  down: async () => {
    // Best-effort revert: move files back to /uploads root.
    const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
    const proofsDir = path.join(uploadsRoot, 'proofs');
    const thumbsDir = path.join(uploadsRoot, 'thumbnails');

    function moveAll(fromDir) {
      if (!fs.existsSync(fromDir)) return;
      const entries = fs.readdirSync(fromDir, { withFileTypes: true });
      for (const ent of entries) {
        if (!ent.isFile()) continue;
        const name = ent.name;
        const from = path.join(fromDir, name);
        const to = path.join(uploadsRoot, name);
        if (fs.existsSync(to)) continue;
        try {
          fs.renameSync(from, to);
        } catch (_) {}
      }
    }

    moveAll(proofsDir);
    moveAll(thumbsDir);
  }
};
