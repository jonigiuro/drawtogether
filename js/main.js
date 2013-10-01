var Drawer = function() {
    var myDataRef = new Firebase('https://drawtogether.firebaseIO.com/');
    this.mouseDown = false;
    var permanentCanvas = document.getElementById("permanent_canvas");
    var tempCanvas = document.getElementById("temp_canvas");
    var pCtx = permanentCanvas.getContext("2d"); //permanent canvas (the one that renders lines from the server)
    var tCtx = tempCanvas.getContext("2d"); //temporary canvas (only the one client sees it, it renders the line you're currently drawing)
    var clearBtn = document.getElementById('clear-btn');

    var start = { //coordinates of the start and end point of the line
        x: 0,
        y: 0
    }
    
    var end = {
        x: 0,
        y: 0
    }

    var color = 'black';
    
    this.init = function() {
        this.attachEvents();
    }
    
    this.attachEvents = function() {
        var self = this;

        $('.clear').on('click', function(e) {
            myDataRef.remove();
            pCtx.clearRect(0,0,1500,1000); //clear the two canvases
            tCtx.clearRect(0,0,1500,1000);
            e.preventDefault();
        });

        $('.single-color').on('click', function(e) { //change color
        	color = $(this).data().attr;
        	e.preventDefault();
        })

        $('canvas').on('mousedown', function(e) {
        	e.preventDefault();
        })
        
        myDataRef.on('child_added', function(snapshot) { //When there is a new line on the server, draw it on the permanent canvas (renderToPermanent())
            var message = snapshot.val();

            start = {
                x: message.startX,
                y: message.startY
            }
            
            end = {
                x: message.endX,
                y: message.endY
            }

            color = message.color || 'black';

		    self.renderToPermanent();
        });
        
        temp_canvas.onmousemove = function(e) {
            //console.log(e);
            if ( self.mouseDown ) {
                self.drawTempLine(e.clientX, e.clientY);
            }
        }
        
        temp_canvas.onmousedown = function(e) {
            start = {
                x: e.clientX,
                y: e.clientY
            }
            self.mouseDown = true;
        }
        
        temp_canvas.onmouseup = function(e) {
            end = {
                x: e.clientX,
                y: e.clientY
            }
            self.mouseDown = false;
            self.sendToServer(); //When the user has finished drawing the line, send it to the server
        }
    }
    
    this.drawTempLine = function(x, y) { //function to give the user visual feedback of what he's drawing
    	tCtx.strokeStyle = color;
        tCtx.beginPath();
        tCtx.clearRect(0,0,1500,1000);
        tCtx.moveTo(start.x, start.y);
        tCtx.lineTo(x, y);
        tCtx.stroke();
        tCtx.closePath();
    }
                                           
    this.renderToPermanent = function() { //Draws line on the permanent canvas
    	pCtx.strokeStyle = color;
        pCtx.beginPath();
        pCtx.moveTo(start.x, start.y);
        pCtx.lineTo(end.x, end.y);
        pCtx.stroke();
        pCtx.closePath();
    }
    
    this.sendToServer = function() { //actually sends it to the server
        myDataRef.push({
        	color: color,
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y
        });   
    }
    
    
    
    this.init();
}

var drawer = new Drawer();