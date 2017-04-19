NodeList.prototype.forEach = Array.prototype.forEach;
let sun = {};
let metar = {};
let weather = {};
let activePage = 0;

function setActivePage(pageID) {
  activePage = pageID;
  let pages = document.querySelectorAll('.page[id]').forEach(function(page) {
    document.getElementById(page.id).classList.remove("current");
  })
  document.getElementById('page-'+pageID).classList.add("current");

  let navs = document.querySelectorAll('navigation item[id]').forEach(function(nav) {
    document.getElementById(nav.id).classList.remove("current");
  })
  document.getElementById('page-'+pageID+'-nav').classList.add("current");
  document.getElementById('navigation').classList.remove("open");
};

// METAR EDDS
fetch('https://avwx.rest/api/metar/edds')
  .then(function(response) { 
    return response.json();
  })
  .then(function(j) {
    weather = j;
    metar = '<h2>Metar</h2>';
    metar+= '<div>Station</div><div>'+j.Station+'</div>';
    metar+= '<div>METAR Zeit</div><div>'+j.Time.substr(2,2)+':'+j.Time.substr(4,2)+' UTC</div>';
    metar+= '<div>Flight-Rules</div><div>'+j["Flight-Rules"]+''+'</div>';
    metar+= '<div>Altimeter</div><div>'+j.Altimeter+' '+j.Units.Altimeter+'</div>';
    metar+= '<div>Dewpoint</div><div>'+j.Dewpoint*1+' &deg;'+j.Units.Temperature+'</div>';
    metar+= '<div>Temperature</div><div>'+j.Temperature*1+' &deg;'+j.Units.Temperature+'</div>';
    metar+= '<div>Wind-Direction</div><div>'+j["Wind-Direction"]*1+'&deg;';
    //Object.keys(j["Wind-Variable-Dir"]).forEach(function(k){
    if (j["Wind-Variable-Dir"][0] !== false) {
      metar += ' ( ' + j["Wind-Variable-Dir"][0] + '&deg; - '
      metar += j["Wind-Variable-Dir"][1]+'&deg; )';
    }
    //});          
    metar += '</div>'
    metar+= '<div>Wind-Speed</div><div>'+j["Wind-Speed"]*1+' '+j.Units["Wind-Speed"]+'</div>';
    if (j["Wind-Gust"]*1 !== 0) {
      metar+= '<div>Wind-Gust</div><div>'+j["Wind-Gust"]*1+'</div>';
    }
    if (j.Visibility*1 >= 9999 ) {
        metar+= '<div>Visibility</div><div>>= 10 km</div>';
    } else {
      metar+= '<div>Visibility</div><div>'+j.Visibility+'</div>';
    }
    metar+= '<div>Clouds:</div><div>';
    Object.keys(j["Cloud-List"]).forEach(function(k){
      Object.keys(j["Cloud-List"][k]).forEach(function(level){
        if (j["Cloud-List"][k][level] === 'CLR') {
          metar += '<svg class="icon icon-clouds_clr"><use xlink:href="#icon-clouds_clr"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'SKC') {
          metar += '<svg class="icon icon-clouds_skc"><use xlink:href="#icon-clouds_skc"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'SCT') {
          metar += '<svg class="icon icon-clouds_sct"><use xlink:href="#icon-clouds_sct"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'FEW') {
          metar += '<svg class="icon icon-clouds_few"><use xlink:href="#icon-clouds_few"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'BKN') {
          metar += '<svg class="icon icon-clouds_bkn"><use xlink:href="#icon-clouds_bkn"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'OVC') {
          metar += '<svg class="icon icon-clouds_ovc"><use xlink:href="#icon-clouds_ovc"/></svg> '
        } else if (j["Cloud-List"][k][level] === 'OVX') {
          metar += '<svg class="icon icon-clouds_ovx"><use xlink:href="#icon-clouds_ovx"/></svg> '
        } else {
          if(j["Cloud-List"][k][level] === 'TCU') {
            metar += ' towering cumulus';
          } else if(j["Cloud-List"][k][level] === 'CB') {
            metar += ' cumulonimbus';
          } else {
            metar += ' FL ';
            metar += j["Cloud-List"][k][level]+' ';
          }
        }
      });
      metar += '<br/>';
    });
    metar+= '</div>';
    if (j.Remarks !== 'NOSIG' ) {
      metar+= '<div>Remarks</div><div>'+j.Remarks+'</div>';
    }
    metar+= '<div class="rawdata">Raw</div><div class="rawdata">'+j["Raw-Report"]+''+'</div>';

    //metar+= '<div>Altimeter</div><div>'+j.Altimeter+' '+j.Units.Altimeter+'</div>';
    document.querySelector('.currentsituation>.metar').innerHTML = metar;  
});
// sunrise-sunset
//fetch('http://api.sunrise-sunset.org/json?lat=48.631944&lng=9.430556&date=today&formatted=0')
fetch('https://api.sunrise-sunset.org/json?lat=48.631944&lng=9.430556&date=today&formatted=1')
  .then(function(response) { 
    return response.json();
  })
  .then(function(sun) {
    document.querySelector('.sun').innerHTML = '<div>Sunrise</div><div>'+sun.results.sunrise+'</div><div>Sunset</div><div>'+sun.results.sunset+'</div>';  
});

document.addEventListener('DOMContentLoaded', function() {
  let listOfPages = '';
  let allpages = document.querySelectorAll('.page').forEach(function(page, i) {
  page.setAttribute('id', 'page-'+i);
    let headlines = page.querySelectorAll('.page>.nav-label:first-child, .page:not(.nav-label)>h1:first-child, .page:not(.nav-label):not(h1)>h2:first-child, .page:not(.nav-label):not(h1):not(h2)>h3:first-child').forEach(function(pagetitle){
      let pullright = page.classList.contains('nav-pull-right');
      if (pullright) {
        listOfPages += "<item id='page-"+i+"-nav' onclick='setActivePage("+i+");' class='nav-pull-right'><span>"+pagetitle.innerText+"</span></item>";
      } else {
        listOfPages += "<item id='page-"+i+"-nav' onclick='setActivePage("+i+");'><span>"+pagetitle.innerText+"</span></item>";
      };
    })

  })
  document.getElementById('navigation').innerHTML = listOfPages
  setActivePage(0);

  let pages = document.querySelector('body');
  let mc = new Hammer(pages);
  let lastpage = document.querySelectorAll('.page[id]').length;
  mc.on("swipeleft swiperight tap press", function(ev) {
      console.log(ev.type +" gesture detected.");
      switch (ev.type) {
        case "swipeleft":
          if (activePage < lastpage-1) {
            setActivePage(activePage+1);
          }
          break;
        case "swiperight": 
          if (activePage > 0) {
            setActivePage(activePage-1);
          }
          break;
      }
  });
});