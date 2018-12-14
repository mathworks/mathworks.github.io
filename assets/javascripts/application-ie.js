function truncate(text, length) {
  if (!length) length = 80
  if (!text)
    return '';

  if (text.length > length)
    return text.substring(0,text.indexOf(" ", 70)) + '...';
  else
    return text;
}

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE*60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR*24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY*7;
const SECONDS_IN_MONTH = SECONDS_IN_DAY*30.4;
const SECONDS_IN_YEAR = SECONDS_IN_DAY*365.25;

function timeago(date) {
    var seconds = Math.floor((new Date() - date) / 1000), mins = 0, days = 0, hrs = 0, wks = 0, mos = 0, yrs = 0;
    if (seconds > SECONDS_IN_YEAR && (yrs = Math.round(seconds/SECONDS_IN_YEAR)))
      return (yrs == 1 ? yrs + " year ago" : yrs + " year ago");
    else if (seconds > SECONDS_IN_MONTH && (mos = Math.round(seconds/SECONDS_IN_MONTH)))
      return (mos == 1 ? mos + " month ago" : mos + " months ago");
    else if (seconds > SECONDS_IN_WEEK && (wks = Math.round(seconds/SECONDS_IN_WEEK)))
      return (wks == 1 ? wks + " week ago" : wks + " weeks ago");
    else if (seconds > SECONDS_IN_DAY && (days = Math.round(seconds/SECONDS_IN_DAY)))
      return (days == 1 ? days + " day ago" : days + " days ago");
    else if (seconds > SECONDS_IN_HOUR && (hrs = Math.round(seconds/SECONDS_IN_HOUR)))
      return (hrs == 1 ? hrs + " hour ago" : hrs + " hours ago");
    else if (seconds > SECONDS_IN_MINUTE && (mins = Math.round(seconds/SECONDS_IN_MINUTE)))
      return (mins == 1 ? mins + " minute ago" : mins + " minutes ago");
    else
      return "seconds ago";
}

var gh = {PAGE_SIZE: 6, repos: [], page: 0, index: 0};


   $.getJSON( "assets/javascripts/stats.json?d=" + Date.now(), function( data ) {
     gh.stats = data;
     // Update stats
     $('#stats-org-count').html(gh.stats.org_total);
     $('#stats-repo-count').html(gh.stats.repo_total);
     $('#stats-ctrb-count').html(gh.stats.ctrb_total);

     // Update top contributors
     gh.stats.top_contributors.forEach(function(ctrb) {
        $("#contributor-avatars").append("<a href='" + ctrb.url + "' onclick=\"trackOutboundLink('" + ctrb.url + "'); return false;\"><img src='" + ctrb.avatar + "' class='git_avatar'></a>");
     });
   });
   $.getJSON( "assets/javascripts/cache.json?d=" + Date.now(), function( data ) {
     gh.repos = data.repos;
     for (var i = 0; i < gh.repos.length; i++)
       gh.repos[i].updated_at = new Date(gh.repos[i].updated_at);

     // sort by active
     gh.repos.sort(function(a,b) { return b.updated_at.getTime() - a.updated_at.getTime() });
     loadMoreRepos();
   });
