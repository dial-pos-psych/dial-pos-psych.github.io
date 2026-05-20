# Dialectical Positive Psychology

Static Jekyll site published with GitHub Pages.

Public URL after deployment:

```text
https://dial-pos-psych.github.io/
```

Build locally:

```powershell
bundle install
bundle exec jekyll build
```

Repository notes:

- keep `_site/`, caches, temporary files, private drafts and secrets out of Git;
- keep MP4 files only while every single file stays below GitHub's 100 MB limit;
- GitHub Actions workflow is stored in `.github/workflows/pages.yml`;
- no custom `CNAME` is used while the site stays on the free `github.io` domain.
