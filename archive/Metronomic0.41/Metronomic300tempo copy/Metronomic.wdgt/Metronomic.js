	var bpmArray = new Array();
	// metronome vars:
	var c=0;
	var t; // metronome beat interval
	var animation_interval; // metronome animation interval
	var lock = 0;
	var cur_vis = 0;
	// Visualization constants:
	var VIS_SQUARE = 0;
	var VIS_COUNT = 1;
	var VIS_ANALOG = 2;
	var VIS_NUM_VISUALIZATIONS = 3;
	
	var VIS_ANALOG_MAX_ANGLE = 50;
	var VIS_ANALOG_FPS = 60;
	
	// square visualization-->
	var vis_square_metroY = 50;
	var vis_square_metroXdefault = 93;
	var vis_square_metroXoffset = 30;
	var vis_square_curPos = true;
	
	// count visualization-->
	var vis_count_count = 1;
	// beats per cycle
	var vis_count_bpc = 4;
	
	// analog visualization -->
	// vertical offset:
	var vis_analog_metroYoffset = 90;
	// current angle:
	var vis_analog_curAngle = 0;
	// current rotation direction:
	var vis_analog_dir = true;
	
	// default BPM value
	var currentBPM = 60; 
	var animateTempo = currentBPM; // this is to prevent our animation timer from being affected
	
	// version variables
	var currentVersion; 
	var serverVersion;
	
	// apple buttons
	var gDoneButton; 
	var gInfoButton; 
	
	// convert degree value into radian units
	function degree2rad(degree) {
		return degree / 180 * Math.PI;
	}
	
	// create the BPM array options
	function generateBPMArray() {
		// Range of values: 40-208
		var granularity = 4;
		var range_min = 40;
		var range_max = 300;
		
		var i;	
		for (i = range_min; i <= range_max; i+=granularity) {
			bpmArray[i] = i;
		}
	}
	
	// write the BPM array options
	function writeBPMArray() {		
		for (var x in bpmArray)
		{
			document.write('<option value="' + bpmArray[x] + '"');
			if (bpmArray[x] == currentBPM) {
				document.write(' selected');
			}
			document.writeln('>' + bpmArray[x] + "</option>");
		}	
	}
	
		// write the BPC array options
	function writeBPCArray() {
		for (var i=1; i<=32; i++)
		{
			document.write('<option value="' + i + '"');
			if (i == vis_count_bpc) {
				document.write(' selected');
			}
			document.writeln('>' + i + "</option>");
		}	
	}
	
	// refresh the current BPM values
	function refreshBPM() {
		// bpm dropdown has just been altered, so access that form element and set current BPM
		currentBPM = document.metronomeForm.bpm_select.value;
		//currentBPM = document.metronomeForm.bpm_select_textbox.value;
		document.getElementById("bpm_select_textbox").innerHTML = currentBPM;
		// timer needs to refresh
		lock = 0;
	}
	
	// refresh the current BPC values
	function refreshBPC() {
		// bpc dropdown has just been altered, so access that form element and set current BPC
		vis_count_bpc = document.metronomeForm.bpc_select.value;
		//currentBPM = document.metronomeForm.bpm_select_textbox.value;
		document.getElementById("bpc_select_textbox").innerHTML = vis_count_bpc;
	}
	
	// create and write out the visualization array options
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
		
		//SQUARE
		document.write('<option value="' + VIS_SQUARE + '"');
		if (write_vis == VIS_SQUARE) {
			document.write(' selected');
		}
		document.writeln('>' + "Square" + "</option>");
		
		//COUNT
		document.write('<option value="' + VIS_COUNT + '"');
		if (write_vis == VIS_COUNT) {
			document.write(' selected');
		}
		document.writeln('>' + "Count" + "</option>");
		
		// ANALOG
		
		document.write('<option value="' + VIS_ANALOG + '"');
		if (write_vis == VIS_ANALOG) {
			document.write(' selected');
		}
		document.writeln('>' + "Analog" + "</option>");
		
	}
	
	// refresh the current visualization setting and save it into preferences
	function refreshVis() {
		// visualization dropdown has just been altered, so access that form element and set cur_vis and save
		cur_vis = document.preferenceForm.vis_select.value;
		// save into preferences
		if(window.widget) {
			// check and make sure value is valid:
			if (cur_vis >= 0 && cur_vis < VIS_NUM_VISUALIZATIONS) {
				widget.setPreferenceForKey(cur_vis,"cur_vis");
			}
		}
		
		// refresh controls
		showBPCcontrols();
		
		refreshVisDropdown();
	}
	
	//refreshes the current visualization dropdown text:
	function refreshVisDropdown() {
		// Visualization select dropdown text
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
		// Move BPM down
		var bpmtext = document.getElementById("bpm_select_textbox");
		var bpmselect = document.getElementById("bpm_select");
		var bpmselectbg = document.getElementById("bpm_select_bg");
		var bpmlabel = document.getElementById("bpm_label");
		
		bpmtext.style.bottom = 40 + "px";
		bpmselect.style.bottom = 36 + "px";
		bpmselectbg.style.bottom = 38 + "px";
		bpmlabel.style.bottom = 39 + "px";
		
		// show BPC
		var bpctext = document.getElementById("bpc_select_textbox");
		var bpcselect = document.getElementById("bpc_select");
		var bpcselectbg = document.getElementById("bpc_select_bg");
		var bpclabel = document.getElementById("bpc_label");

		bpctext.style.display = "block";
		bpcselect.style.display = "block";
		bpcselectbg.style.display = "block";
		bpclabel.style.display = "block";
	}
	
	// hide beats per cycle controls
	function hideBPCcontrols() {
		// Move BPM to default
		var bpmtext = document.getElementById("bpm_select_textbox");
		var bpmselect = document.getElementById("bpm_select");
		var bpmselectbg = document.getElementById("bpm_select_bg");
		var bpmlabel = document.getElementById("bpm_label");
		
		bpmtext.style.bottom = 50 + "px";
		bpmselect.style.bottom = 46 + "px";
		bpmselectbg.style.bottom = 48 + "px";
		bpmlabel.style.bottom = 49 + "px";
		
		// hide BPC
		var bpctext = document.getElementById("bpc_select_textbox");
		var bpcselect = document.getElementById("bpc_select");
		var bpcselectbg = document.getElementById("bpc_select_bg");
		var bpclabel = document.getElementById("bpc_label");
		
		bpctext.style.display = "none";
		bpcselect.style.display = "none";
		bpcselectbg.style.display = "none";
		bpclabel.style.display = "none";
	}
	
	// Setup initial load
	function setup() 
	{
		checkVersion();
		
		gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", hidePrefs); 
		gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "white", "white", showPrefs); 
		
		// Clear the screen
		clear();
		
		// Set preferences:
		// set bpm at 60 (default) when widget has just been opened
		currentBPM = 60;
		// make sure the textbox is showing:
		refreshBPM();
		
		// set bpc at 4 (default) when widget has just been opened
		vis_count_bpc = 4;
		// make sure the textbox is showing:
		refreshBPC();
		
		// load the visualization preference
		if(window.widget) {
			widget.onshow = checkVersion;
	
			// Current visualization -->
			var temp_vis = widget.preferenceForKey("cur_vis");
			
			// VALID preference
			if (temp_vis >= 0 && temp_vis < VIS_NUM_VISUALIZATIONS) {
			
				cur_vis = temp_vis;
			}
			// INVALID preference:
			else {
				// set to default setting
				cur_vis = VIS_SQUARE;
				// reset the preference key
				widget.setPreferenceForKey(VIS_SQUARE,"cur_vis");
				cur_vis = temp_vis;
			}
		}
		
		// refresh controls
		showBPCcontrols();
		
		refreshVisDropdown();
	}
	
	// Show Prefs view
	function showPrefs() 
	{ 
		var front = document.getElementById("front"); 
		var back = document.getElementById("back"); 
	
		if (window.widget) 
			widget.prepareForTransition("ToBack"); 
	  
		front.style.display="none"; 
		back.style.display="block"; 
	  
		if (window.widget) 
			setTimeout ('widget.performTransition();', 0);
			  
		// Stop the metronome if it is running
		if (document.metronomeForm.trigger_btn.value == "Stop") {
			buttonTrigger();
		}
	} 
	
	// Hide Prefs view
	function hidePrefs() 
	{ 
		var front = document.getElementById("front"); 
		var back = document.getElementById("back"); 
		
		if (window.widget) 
			widget.prepareForTransition("ToFront"); 
	  
		back.style.display="none"; 
		front.style.display="block"; 
		
		if (window.widget) 
			setTimeout ('widget.performTransition();', 0); 
	} 
	
	// canvas:
	
	// clear the screen
	function clear() {
		var canvas = document.getElementById("canvas"); 
		var ctx = canvas.getContext("2d"); 
		
		// clear canvas
		ctx.clearRect(0, 0, 200, 200);
		ctx.save();
		
		// clear count
		var counter = document.getElementById("count_text");
		counter.innerHTML = "";
	}
	
	// draw the metronome with square visualization
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
		
		//ctx.translate(50, 50);
		//ctx.fillStyle = "rgb(150,150,150)";
		ctx.fillStyle = "rgb(0,102,204)";
		//ctx.fillStyle = "rgb(102,0,0)";
		//ctx.translate(200/2, 150);
		//ctx.drawImage('Dot.png', 0, 0, 20, 20);
		ctx.fillRect(0, 0, 10, 10);
		
		ctx.restore();
		ctx.restore();
	}
	
	// draw the metronome with count visualization
	function countMetronome() {

		// initiate count
		var counter = document.getElementById("count_text");
		

		//vis_count_count = ( vis_count_count + vis_count_bpc + 1) % vis_count_bpc;
		counter.innerHTML = vis_count_count;
		
		if (vis_count_count > 9) {
			document.getElementById("count").style.left = 76 + "px";
		}
		else {
			document.getElementById("count").style.left = 86 + "px";
		}
	}
	
	// draw the metronome with the analog visualization
	function analogMetronome() 
	{
		// Boundary switch:
		// Play sound and switch direction
		/*
		if ((vis_analog_curAngle <= 0 && !vis_analog_dir) || (vis_analog_curAngle >= 2*VIS_ANALOG_MAX_ANGLE && vis_analog_dir)) {
			// switch directions:
			vis_analog_dir = !vis_analog_dir;
		}
		*/
		
		var canvas = document.getElementById("canvas"); 
		var ctx = canvas.getContext("2d"); 
	
		ctx.clearRect(0, 0, 200, 200);
		ctx.save();
		
		ctx.translate(100, vis_analog_metroYoffset);
		ctx.save();
		
		// vertical pointing up
		ctx.rotate(degree2rad(180)); 
		
		// max left rotation angle / minimum
		if (vis_analog_dir) {
			vis_analog_curAngle = -VIS_ANALOG_MAX_ANGLE;
			ctx.rotate(degree2rad(-VIS_ANALOG_MAX_ANGLE)); 
		}
		else {
			vis_analog_curAngle = VIS_ANALOG_MAX_ANGLE;
			ctx.rotate(degree2rad(VIS_ANALOG_MAX_ANGLE)); 
		}
		
		/*
		// Apply rotation:
		// Alpha = FPS / BPM * 60
		// Angle granularity = VIS_ANALOG_MAX_ANGLE / Alpha;
		var alpha = VIS_ANALOG_FPS / currentBPM * 60;
		
		if (vis_analog_dir) {
			vis_analog_curAngle += 2*VIS_ANALOG_MAX_ANGLE/alpha;
			ctx.rotate(degree2rad(vis_analog_curAngle));
		}
		// going the other way
		else {
			vis_analog_curAngle -= 2*VIS_ANALOG_MAX_ANGLE/alpha;
			ctx.rotate(degree2rad(vis_analog_curAngle));
		}
		//ctx.rotate(degree2rad());
		*/
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
		
		// vertical pointing up
		ctx.rotate(degree2rad(180));
		
		// Apply rotation:
		// Alpha = Frames / Beat
		// Alpha = FPS / (BPM * 60) [beats per second]
		// Angle granularity = VIS_ANALOG_MAX_ANGLE / Alpha;
		var alpha = VIS_ANALOG_FPS / animateTempo * 60;
		var slice = (2*VIS_ANALOG_MAX_ANGLE)/alpha;
		if (!vis_analog_dir) {
			vis_analog_curAngle += slice;
			ctx.rotate(degree2rad(vis_analog_curAngle));
		}
		// going the other way
		else {
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
		document.tickSound.Stop();
		document.tick2Sound.Stop();
	}
	
	// convert the bpm value to a millisecond delay time
	function bpm_to_ms(bpm) {
		//bps = bpm/60
		//ms = 1/bps
		return 60000/bpm;
	}
	
	// trigger action based on the button push
	function buttonTrigger() {
		// always reset the count
		vis_count_count = 0;
		// reset analog position
		vis_analog_curAngle = 0;
		vis_analog_dir = true;
		lock = 0;
		
		if(document.metronomeForm.trigger_btn.value == "Start") {
			document.metronomeForm.trigger_btn.value = "Stop";
			//animator();
			//interval = setInterval("animator()", 60000/bpm);
			metronomeTimer();
		}
		else {
			document.metronomeForm.trigger_btn.value = "Start";
			//count = 1;
			//clearInterval(interval);
			clearInterval(t);
			clearInterval(animation_interval);
			//clearTimeout(t);
			clear();
		}
	}
	
	// timer algorithm loop to refresh the metronome
	function metronomeTimer() {
		// Testing Only:
		//document.getElementById('txt').value=c;
		//c=c+1;
		
		// increment
		vis_count_count++;

		if (vis_count_count > vis_count_bpc) {
			vis_count_count = 1;
		}
		clearInterval(animation_interval);
		animateTempo = currentBPM;
		animation_interval = setInterval("analogAnimate()", 1000/VIS_ANALOG_FPS);
		
		// clear sound
		clear_sound();
		
		if (vis_count_count==1) {
			document.tick2Sound.Play();
		}
		else {
			document.tickSound.Play();
		}
			
		if (cur_vis == VIS_SQUARE) {
			drawMetronome();
			//t=setTimeout("metronomeTimer()", bpm_to_ms(currentBPM));
		}
		else if (cur_vis == VIS_COUNT) {
			countMetronome();
			//t=setTimeout("metronomeTimer()", bpm_to_ms(currentBPM));
		}
		else if (cur_vis == VIS_ANALOG) {
			analogMetronome();
			// refresh view at 30 fps:
			//t=setTimeout("metronomeTimer()", 1000/VIS_ANALOG_FPS);
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
	
	// String trim function
	String.prototype.trim = function() {
		return this.replace(/^\s*|\s*$/g, "")
	}

	// Modified version of update script by Jon Brown from http://www.widgetshow.com/?page_id=74
	function checkVersion() {  //called when the html document is loaded
		currentVersion = widget.system("/bin/sh -c 'defaults read `pwd`/Info CFBundleVersion'", null).outputString;
		//currentVersion = trim(currentVersion);
		currentVersion = currentVersion.trim();
		checkForUpdate();
	} 
	
	var req;
	function checkForUpdate() {
		req = new XMLHttpRequest();
		req.onreadystatechange = compareVersion;
		req.open("GET", "http://www.lostclouds.com/Metronomic/currentVersion.php", true);
		req.setRequestHeader("Cache-Control", "no-cache");
		req.send(null);
	} 
	
	function compareVersion() {
		if (req.readyState == 4) {
			if (req.status == 200) {
				serverVersion = req.responseText; 
	
				if ((currentVersion < serverVersion) && (serverVersion != null) && (serverVersion != "")) {
					document.getElementById('updateMessage').style.display='block';
					document.getElementById('updateLink').style.display='block';
					document.getElementById('updateLink_bg').style.display='block';
				} else {
					document.getElementById('updateMessage').style.display='none';
					document.getElementById('updateLink').style.display='none';
					document.getElementById('updateLink_bg').style.display='none';
				}
			}
		}
	} 
	
	// End update script