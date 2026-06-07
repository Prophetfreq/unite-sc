PRAYER GUIDE PDFs — drop them here.

These files are served at  https://your-site.com/prayer/<filename>
and are linked from the Prayer Hub page (src/PrayerHub.jsx).

NEEDED FILES (filenames must match the `guide` paths in PrayerHub.jsx):
  how-to-pray-on-site.pdf      <- shared instructions (same for every spot)
  aiken-courthouse.pdf
  aiken-schools.pdf
  sc-statehouse.pdf
  charleston-harbor.pdf
  florence-downtown.pdf
  greenville-falls.pdf

To add a NEW destination:
  1. Add a PDF here, e.g.  my-new-spot.pdf
  2. In src/PrayerHub.jsx, add an entry to the DESTINATIONS list with
     guide: '/prayer/my-new-spot.pdf'
