var bpmArray = new Array();
// Metronome variables
var c=0;
var t; // metronome beat interval
var animation_interval; // metronome animation interval
var lock = 0; // if set to 1, it means that nothing has changed, 0 means the interval needs to be refreshed to the new bpm
var cur_vis = 0;
// Visualization constants:
var VIS_SQUARE = 0;
var VIS_COUNT = 1;
var VIS_ANALOG = 2;
var VIS_NUM_VISUALIZATIONS = 3;

var VIS_ANALOG_MAX_ANGLE = 50;
var VIS_ANALOG_FPS = 60;

// square visualization-->
var vis_square_metroY = 65;
var vis_square_metroXdefault = 93;
var vis_square_metroXoffset = 30;
var vis_square_curPos = true;

// count visualization-->
var vis_count_count = 1;
var vis_count_bpc = 4; // beats per cycle

// analog visualization -->
var vis_analog_metroYoffset = 105; // vertical offset
var vis_analog_curAngle = 0; // current angle
var vis_analog_dir = true; // current rotation direction

// default BPM value
var currentBPM = 60; 
var animateTempo = currentBPM; // this is to prevent our animation timer from being affected

// Sounds
var tickSound = new Audio("tick.wav"); // buffers automatically when created
var tick2Sound = new Audio("tick2.wav"); // buffers automatically when created

// apple buttons
var gDoneButton; 
var gInfoButton; 

function degree2rad(degree) {
  return degree / 180 * Math.PI;
}

// create the BPM array options - range: 40-208
function generateBPMArray() {
  var granularity = 4;
  var range_min = 40;
  var range_max = 208;
  
  for (var i = range_min; i <= range_max; i+=granularity) {
    bpmArray[i] = i;
  }
}

// write the BPM array options
function writeBPMArray() {    
  for (var x in bpmArray) {
    document.write('<option value="' + bpmArray[x] + '"' + (bpmArray[x] == currentBPM?" selected":"")+'>' + bpmArray[x] + "</option>");
  } 
}

// write the BPC array options
function writeBPCArray() {
  for (var i=1; i<=32; i++) {
    document.writeln('<option value="' + i + '"' + (i == vis_count_bpc?" selected":"")+">" + i + "</option>");
  } 
}

// refresh current BPM values - dropdown just altered, access form element, set current value
function refreshBPM() {
  currentBPM = document.metronomeForm.bpm_select.value;
  document.getElementById("bpm_select_textbox").innerHTML = currentBPM;
  lock = 0; // timer needs to refresh
}

// refresh current BPC values - dropdown just altered, access form element, set current value
function refreshBPC() {
  vis_count_bpc = document.metronomeForm.bpc_select.value;
  document.getElementById("bpc_select_textbox").innerHTML = vis_count_bpc;
}

// generate visualization array options
function writeVisualizationArray() {
  var write_vis = 0;
  
  // load preferences
  if(window.widget) {
    var temp_vis = widget.preferenceForKey("cur_vis");
    
    // VALID preference
    if (temp_vis >= 0 && temp_vis < VIS_NUM_VISUALIZATIONS) {
      write_vis = temp_vis;
    }
  }
  
  document.writeln('<option value="' + VIS_SQUARE + '"' + (write_vis == VIS_SQUARE? " selected":"") + ">Square</option>");
  document.writeln('<option value="' + VIS_COUNT + '"' + (write_vis == VIS_COUNT? " selected":"") + ">Count</option>");
  document.writeln('<option value="' + VIS_ANALOG + '"' + (write_vis == VIS_ANALOG? " selected":"") + ">Analog</option>");
}

// refresh current visualization setting / save preferences
function refreshVis() {
  // dropdown just altered, access form element, set cur_vis, save
  cur_vis = document.preferenceForm.vis_select.value;
  // save into preferences
  if(window.widget) {
    // VALID preference
    if (cur_vis >= 0 && cur_vis < VIS_NUM_VISUALIZATIONS) {
      widget.setPreferenceForKey(cur_vis,"cur_vis");
    }
  }
  // refresh controls
  showBPCcontrols();
  refreshVisDropdown();
}

//refreshes current visualization dropdown text:
function refreshVisDropdown() {
  var visTextSelect = document.getElementById("vis_select_textbox");
  
  if (cur_vis == VIS_SQUARE) {
    visTextSelect.innerHTML = "Square";
  }
  else if (cur_vis == VIS_COUNT) {
    visTextSelect.innerHTML = "Count";
  }
  else if (cur_vis == VIS_ANALOG) {
    visTextSelect.innerHTML = "Analog";
  }
  else {
    visTextSelect.innerHTML = cur_vis;
  }
}

// show beats per cycle controls
function showBPCcontrols() {
  var bpmtext = document.getElementById("bpm_select_textbox");
  var bpmselect = document.getElementById("bpm_select");
  var bpmselectbg = document.getElementById("bpm_select_bg");
  var bpmlabel = document.getElementById("bpm_label");
  
  bpmtext.style.bottom = 40 + "px";
  bpmselect.style.bottom = 36 + "px";
  bpmselectbg.style.bottom = 38 + "px";
  bpmlabel.style.bottom = 39 + "px";
  
  var bpctext = document.getElementById("bpc_select_textbox");
  var bpcselect = document.getElementById("bpc_select");
  var bpcselectbg = document.getElementById("bpc_select_bg");
  var bpclabel = document.getElementById("bpc_label");

  bpctext.style.display = "block";
  bpcselect.style.display = "block";
  bpcselectbg.style.display = "block";
  bpclabel.style.display = "block";
}

// Setup initial load
function setup() {    
  gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", hidePrefs); 
  gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showPrefs); 
  
  clear();
  
  // Set default preferences (widget just opened)
  currentBPM = 60; // set bpm at 60
  refreshBPM();
  vis_count_bpc = 4; // set bpc at 4
  refreshBPC();
  
  // load the visualization preference
  if(window.widget) {
    // Current visualization -->
    var temp_vis = widget.preferenceForKey("cur_vis");
    if (temp_vis >= 0 && temp_vis < VIS_NUM_VISUALIZATIONS) {
      cur_vis = temp_vis;
    }
    // INVALID preference - default setting and preference key
    else {
      cur_vis = VIS_SQUARE; 
      widget.setPreferenceForKey(VIS_SQUARE,"cur_vis");
    }
  }
  
  showBPCcontrols(); // refresh controls
  refreshVisDropdown();
}

function showPrefs() { 
  var front = document.getElementById("front"); 
  var back = document.getElementById("back"); 

  if (window.widget) {
    widget.prepareForTransition("ToBack"); 
  }
  front.style.display = "none"; 
  back.style.display = "block"; 
  
  if (window.widget) {
    setTimeout ('widget.performTransition();', 0);
  }
  // Stop the metronome
  if (document.metronomeForm.trigger_btn.value == "Stop") {
    buttonTrigger();
  }
} 

// Hide Prefs view
function hidePrefs() { 
  var front = document.getElementById("front"); 
  var back = document.getElementById("back"); 
  
  if (window.widget) {
    widget.prepareForTransition("ToFront"); 
  }
  back.style.display="none"; 
  front.style.display="block";
  if (window.widget) {
    setTimeout ('widget.performTransition();', 10);
  }
} 

// CANVAS FUNCTIONS -->
function clear() {
  var canvas = document.getElementById("canvas"); 
  var ctx = canvas.getContext("2d"); 

  ctx.clearRect(0, 0, 200, 200); // clear canvas
  ctx.save();

  var counter = document.getElementById("count_text"); // clear count
  counter.innerHTML = "";
}

// draw metronome - square visualization
function drawMetronome () {
  var canvas = document.getElementById("canvas"); 
  var ctx = canvas.getContext("2d"); 
  
  ctx.clearRect(0, 0, 200, 200);
  ctx.save();
  
  // Start Translation
  if (vis_square_curPos) {
    vis_square_metroX = vis_square_metroXdefault - vis_square_metroXoffset;
  }
  else {
    vis_square_metroX = vis_square_metroXdefault + vis_square_metroXoffset;
  }
  vis_square_curPos = !vis_square_curPos;
  
  ctx.translate(vis_square_metroX, vis_square_metroY);
  ctx.save();
  // End Translation
  
  ctx.fillStyle = "rgb(0,102,204)";
  ctx.fillRect(0, 0, 10, 10);
  
  ctx.restore();
  ctx.restore();
}

// draw metronome - count visualization
function countMetronome() {
  var counter = document.getElementById("count_text"); // initiate count
  counter.innerHTML = vis_count_count;
}

// draw metronome - analog visualization
function analogMetronome() {
  var canvas = document.getElementById("canvas"); 
  var ctx = canvas.getContext("2d"); 

  ctx.clearRect(0, 0, 200, 200);
  ctx.save();
  
  ctx.translate(100, vis_analog_metroYoffset);
  ctx.save();
  
  ctx.rotate(degree2rad(180)); // vertical pointing up
  
  // max left rotation angle / minimum
  if (vis_analog_dir) {
    vis_analog_curAngle = -VIS_ANALOG_MAX_ANGLE;
    ctx.rotate(degree2rad(-VIS_ANALOG_MAX_ANGLE)); 
  }
  else {
    vis_analog_curAngle = VIS_ANALOG_MAX_ANGLE;
    ctx.rotate(degree2rad(VIS_ANALOG_MAX_ANGLE)); 
  }
  
  // Draw Needle -->
  ctx.fillStyle = "rgb(0,102,204)";
  ctx.beginPath();
  
  ctx.moveTo(0, 0);
  ctx.lineTo(3, 3);
  ctx.lineTo(0, 68);
  ctx.lineTo(-3, 3);
  ctx.lineTo(0, 0);
   
  ctx.fill();
  // <-- End Needle
  ctx.restore(); 
  ctx.restore();
  
  // Reverse direction
  vis_analog_dir = !vis_analog_dir;
}

// update the analog metronome
function analogAnimate() {
  var canvas = document.getElementById("canvas"); 
  var ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 200, 200);
  ctx.save();
  ctx.translate(100, vis_analog_metroYoffset);
  ctx.save();
  
  ctx.rotate(degree2rad(180)); // vertical pointing up
  
  // Apply rotation:
  // Alpha = Frames / Beat = FPS / (BPM * 60) [beats per second]
  // Angle granularity = VIS_ANALOG_MAX_ANGLE / Alpha;
  var alpha = VIS_ANALOG_FPS / animateTempo * 60;
  var slice = (2*VIS_ANALOG_MAX_ANGLE)/alpha;
  if (!vis_analog_dir) {
    vis_analog_curAngle += slice;
    ctx.rotate(degree2rad(vis_analog_curAngle));
  }
  else { // going the other way
    vis_analog_curAngle -= slice;
    ctx.rotate(degree2rad(vis_analog_curAngle));
  }
  
  // Draw Needle -->
  ctx.fillStyle = "rgb(0,102,204)";
  ctx.beginPath();
  
  ctx.moveTo(0, 0);
  ctx.lineTo(3, 3);
  ctx.lineTo(0, 68);
  ctx.lineTo(-3, 3);
  ctx.lineTo(0, 0);
  ctx.fill();
  // <-- End Needle
  ctx.restore(); 
  ctx.restore();
}

// clear the sound to play the next tick
function clear_sound() {
  tickSound.pause();
  tickSound.currentTime=0;
  tick2Sound.pause();
  tick2Sound.currentTime=0;
}

// convert the bpm value to a millisecond delay time
function bpm_to_ms(bpm) {
  // bps = bpm/60;ms = 1/bps
  return 60000/bpm;
}

function buttonTrigger() {
  vis_count_count = 0; // always reset the count
  vis_analog_curAngle = 0; // reset analog position
  vis_analog_dir = true;
  lock = 0;
  
  if(document.metronomeForm.trigger_btn.value == "Start") {
    document.metronomeForm.trigger_btn.value = "Stop";
    metronomeTimer();
  }
  else {
    document.metronomeForm.trigger_btn.value = "Start";
    clearInterval(t);
    clearInterval(animation_interval);
    clear();
  }
}

// timer algorithm loop to refresh the metronome
function metronomeTimer() {
  vis_count_count++; // increment

  if (vis_count_count > vis_count_bpc) {
    vis_count_count = 1;
  }
  clearInterval(animation_interval);
  animateTempo = currentBPM;
  
  // clear sound
  // clear_sound();
  
  // Customization for 12BPM downbeat
  if (vis_count_bpc == 12) {
    if (vis_count_count==12) {
      tick2Sound.currentTime=0;
      tick2Sound.play();
    }
    else {
      tickSound.currentTime=0;
      tickSound.play();
    }
  }
  else {
    if (vis_count_count==1) {
      tick2Sound.currentTime=0;
      tick2Sound.play();
    }
    else {
      tickSound.currentTime=0;
      tickSound.play();
    }
  }
    
  if (cur_vis == VIS_SQUARE) {
    drawMetronome();
  }
  else if (cur_vis == VIS_COUNT) {
    countMetronome();
  }
  else if (cur_vis == VIS_ANALOG) {
    animation_interval = setInterval("analogAnimate()", 1000/VIS_ANALOG_FPS);
    analogMetronome();
  }
  
  // lock = 0 means that we need to re-set the interval
  if (lock==0) {
    clearInterval(t);
    t = setInterval("metronomeTimer()", bpm_to_ms(currentBPM));
    lock = 1;
  }
}

// Event keys:
function checkKey(e) {
  if (e.keyCode == 13) {
    refreshBPM();
  }
  else if (e.keyCode == 32) {
    buttonTrigger();
  }
}

String.prototype.trim = function() {
  return this.replace(/^\s*|\s*$/g, "")
}
