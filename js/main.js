// Dean Attali / Beautiful Jekyll 2015

// Shorten the navbar after scrolling a little bit down
$(window).scroll(function() {
  if ($(".navbar").offset().top > 50) {
    $(".navbar").addClass("top-nav-short");
  } else {
    $(".navbar").removeClass("top-nav-short");
  }
});

// On mobile, hide the avatar when expanding the navbar menu
$('#main-navbar').on('show.bs.collapse', function () {
  $(".navbar").addClass("top-nav-expanded");
})
$('#main-navbar').on('hidden.bs.collapse', function () {
  $(".navbar").removeClass("top-nav-expanded");
})

var hah;

if (window.location.href.includes("projects")) {
  $.ajax({
    url: "https://api.github.com/users/kootenpv/repos?per_page=30&page=0&sort=updated",
  })
    .done(function( data ) {
      data.forEach((repo) => {
        var center = $("#" + repo.name + " > center");
        if (center.length) {
          center.find("div > .stars").text(repo.stargazers_count);
          center.find("a.repo-description").text(repo.description.replace(/:[^ :]+: ?/, ""));
          center.find("a").attr("href", repo.html_url);
        }
      })
      console.info(data);
      hah = data;
    });
}
