
"use strict";

/*global $,THREE*/

$(function() {

    var mandelbrot = new Mandelbrot();

    $("canvas").on("click", function(e) {
        mandelbrot.click(e);
    });

    mandelbrot.palette();
    mandelbrot.animate();

});

var Mandelbrot = function() {

    //var self = this;

    this.width = 500;
    this.height = 500;

    this.x_center = -0.19925751269043576;
    this.y_center = -1.1000970439286792;

    //this.x_center = -0.9239589894649308;
    //this.y_center = -0.2932939380236929;

    //this.x_center = 0.01343906610320955;
    //this.y_center = 0.6556434127796763;

    //this.x_center = -1.407566731001088;
    //this.y_center = 2.741525895538953e-10;

    //this.x_center = -1.1577828229305074;
    //this.y_center = 0.2856164986065561;

    //this.x_center = -0.7746950588778452
    //this.y_center = 0.12422825411482408;

    //this.x_center = -0.6921964267369209;
    //this.y_center = 0.32641190717339097;

    this.zoom = 5;

    this.escape = 4,
    this.iterations = 100;

    this.color = [];
    this.count = 0;
    this.iteration_count = 0;

    var container = $("#content");
    this.canvas = document.createElement("canvas");

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    container.append(this.canvas);

    this.context = this.canvas.getContext("2d");
    this.image = this.context.getImageData(0, 0, this.width, this.height);
    var buf = new ArrayBuffer(this.image.data.length);
    this.buf8 = new Uint8ClampedArray(buf);
    this.data = new Uint32Array(buf);

    this.stats = new Stats();
    container.append(this.stats.domElement);

    this.test = document.createElement("div");
    container.append(this.test);

};

Mandelbrot.prototype = {

    click: function(e) {

        e.preventDefault();

        var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - this.canvas.offsetLeft;
        var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - this.canvas.offsetTop;
        var x_step = this.zoom / this.width;
        var y_step = this.zoom / this.height;
        var center_x = (x - (this.width / 2)) * x_step;
        var center_y = (y - (this.height / 2)) * y_step;

        this.x_center += center_x;
        this.y_center += center_y;
        this.zoom /= 2;

        console.log("x_center: " + this.x_center + " y_center: " + this.y_center + " zoom: " + this.zoom);

        this.render();

    },

    palette: function() {

        for (var i = 0; i < 360; i++) {

            this.color[i] = [];

            var h = i / 360;
            var s = 1;
            var l = 0.5;

            var hsl = new THREE.Color;
            hsl.setHSL(h, s, l);

            this.color[i].r = parseInt(hsl.r * 255);
            this.color[i].g = parseInt(hsl.g * 255);
            this.color[i].b = parseInt(hsl.b * 255);

        }

        console.dir(this.color);

    },

    animate: function() {

        requestAnimationFrame(this.animate.bind(this));
         if (this.count === 0) {
            console.time('timer');
        }
        this.render();
        this.stats.update();
        if (this.count === 250) {
            console.timeEnd('timer')
        }


        this.zoom *= 0.99;

        this.test.innerHTML = "Zoom: " + parseInt(1 / this.zoom).toExponential() + "<br>" + "Frames: " + this.count + "<br>" + "Iterations: " + this.iteration_count;

        if (this.zoom < 1e-10) {
            this.zoom = 5;
        }

    },

    render: function() {

        var x_step = this.zoom / this.width;
        var y_step = this.zoom / this.height;

        for (var i_y = 0; i_y < this.height; i_y++) {

            var y = this.y_center - (this.zoom / 2) + (i_y * y_step);

            for (var i_x = 0; i_x < this.width; i_x++) {

                var x = this.x_center - (this.zoom / 2) + (i_x * x_step),
                    zx = x,
                    zy = y,
                    zx2 = 0,
                    zy2 = 0;

                for (var i = 0; zx2 + zy2 < this.escape && i < this.iterations; ++i) {

                    zx2 = zx * zx;
                    zy2 = zy * zy;
                    zy = (zx + zx) * zy + y;
                    zx = zx2 - zy2 + x;

                    this.iteration_count += 1;

                }

                var a;

                if (i === this.iterations) {
                    a = 0;
                } else {
                    a = 255;
                }

                i *= 5;
                i += this.count;
                i = Math.floor(i);
                i %= 360;

                var r = this.color[i].r;
                var g = this.color[i].g;
                var b = this.color[i].b;

                this.data[i_y * this.width + i_x] =

                    (a << 24) | // alpha
                    (b << 16) | // blue
                    (g <<  8) | // green
                    r;          // red

            }
        }

        //this.count++;
        this.count += 1;

        this.image.data.set(this.buf8);
        this.context.putImageData(this.image, 0, 0);

    }
};
