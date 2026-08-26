# Static media

This project does not use Firebase Storage at runtime.

Included public assets:

```text
public/media/
├── branding/
│   └── logo.jpg
├── parking/        # imported from the old GitHub Pages deployment
└── checkin/        # add only images that are safe to publish as static URLs
```

Anything under `public/` is served directly by GitHub Pages. Do not put lockbox codes or other sensitive access imagery here unless public URL access is acceptable.

The old encrypted PWA media package is preserved separately under `public/legacy-secure/` and is not used by the V3 runtime.
