{
  "name": "Towadev",
  "version": "0.5.1-alpha",
  "class": "TowaDev",
  "namespace": "final.towadev",
  "assets": "content",
  "sources": [
    {
      "path": "final",
      "pattern": "^(final\\..*)$",
      "filemode": false,
      "namespace": "final"
    },
    {
      "path": "source",
      "pattern": "^(final\\.towadev)$",
      "filemode": true,
      "namespace": "final"
    },
    {
      "path": "source",
      "pattern": "^(final\\.towadev\\..*)$",
      "filemode": true,
      "namespace": "final"
    }
  ],
  "options": {
    "mangle": true,
    "optimize": true,
    "minify": true
  }
}