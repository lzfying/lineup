
function main(renderWidth){

    var //loadingCirlce = createLoadingCircle($("#loading-graphic")),
        container = document.createElement( 'div' ),
        stats = new Stats(), 
        renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } ), 
        /* screen size */
        screenRatio = 23/9;
        standardWidth = 1280,
        screenScale = renderWidth / standardWidth,
        renderHeight = renderWidth/screenRatio,
        standardHeight = standardWidth/screenRatio,
        standardPanelSize = screenScale * 256,
        camera = new THREE.OrthographicCamera(0, renderWidth, renderHeight, 0, -1000, 1000),
        scene = new THREE.Scene();

    /* panels and such */
    var skeletonPanel = createSkeletonPanel(renderer, screenScale),
        namePanel = createNamePanel(renderer, screenScale),
        sharePanel = createSharePanel(renderer, screenScale),
        tinyPanel1 = createTinyPanel1(renderer, screenScale),
        tinyPanel2 = createTinyPanel2(renderer, screenScale),
        tinyPanel3 = createTinyPanel3(renderer, screenScale),
        tinyPanel4 = createTinyPanel4(renderer, screenScale),
        tinyPanel5 = createTinyPanel5(renderer, screenScale),
        aboutPanel = createAboutPanel(renderer, screenScale),
        projectsPanel = createProjectsPanel(renderer, screenScale),
        photosPanel = createPhotosPanel(renderer, screenScale),
        bioPanel = createBioPanel(renderer, screenScale),
        linksPanel = createLinksPanel(renderer, screenScale),
        backgroundPanel = createBackgroundPanel(renderer, renderWidth, renderHeight),
        projectorPanel = createProjectorPanel(renderer, renderWidth, renderHeight, [namePanel, skeletonPanel, tinyPanel1, tinyPanel2, tinyPanel3, tinyPanel4, tinyPanel5, sharePanel, photosPanel, projectsPanel, aboutPanel, bioPanel, linksPanel]),
        subjectPanel = createSubjectPanel(renderer, screenScale);//326, 580, 500 + 326/2, 580/2 - 120 ),
        bottomPanel = createBottomPanel($("#bottom-panel").css({"top":renderHeight - (60 * screenScale) + Math.max(0,(window.innerHeight - renderHeight)/2), "width": renderWidth})),

        carouselPanels = [aboutPanel, linksPanel, bioPanel, photosPanel, projectsPanel],
        carouselLocation = 0,
        carouselGrabbed = false,
        carouselCenter = { x: renderWidth, y: 360 * screenScale},

        interactivePanels = [namePanel, skeletonPanel, sharePanel],
        grabbedPanel = null,
        grabStart = null,

        canvasTop = Math.max(0, (window.innerHeight - renderHeight)/2),

        clock = new THREE.Clock(false);

    // hide the rotation graphic 
    $("#please-rotate").css({display: "none"});

    // unhide the laoding graphic
    $("#cassette-bg").css({"visibility": "visible", "top": window.innerHeight/2 - 100 * screenScale, "left": window.innerWidth/2 - 100 * screenScale });

    /* add add position the main panels */
    scene.add(projectorPanel.quad);
    scene.add(subjectPanel.quad);
    scene.add(backgroundPanel.quad);
    backgroundPanel.quad.material.opacity = .1;

    skeletonPanel.setPosition(350 * screenScale, renderHeight - 20 * screenScale, 1);
    // namePanel.setPosition(50 * screenScale, 358*screenScale, 1);
    // sharePanel.setPosition(20 * screenScale, renderHeight - 20 * screenScale, 1);
    subjectPanel.setPosition(500 * screenScale, 450 * screenScale, 1);
    tinyPanel1.setPosition(2024 * screenScale, 100 * screenScale, .5);
    tinyPanel2.setPosition(-2024 * screenScale, 105 * screenScale, .5);
    tinyPanel3.setPosition(2024 * screenScale, 110 * screenScale, .5);
    tinyPanel4.setPosition(2024 * screenScale, 115 * screenScale, .5);
    tinyPanel5.setPosition(2024 * screenScale, 120 * screenScale, .5);

    sharePanel.setPosition(renderWidth + 1000, 0, 0);
    // put the carouselPanels off the right side of the screen
    for(var i = 0; i< carouselPanels.length; i++){
        carouselPanels[i].setPosition(renderWidth + 1000, 0, 0);

    }
    /* place and position the rendering canvas */
    container.appendChild( stats.domElement );
    document.body.appendChild( container );
    renderer.setSize( renderWidth, renderHeight );
    container.appendChild( renderer.domElement );
    $(renderer.domElement).css({top: canvasTop});

    function createChainedTween(element, commands, repeat){
       if(commands.length < 2){
           return;
       }
       var tweens = [];
        
       tweens[0] = new TWEEN.Tween(commands[0].position)
           .delay(commands[1].delay)
           .to(commands[1].position, commands[1].duration)
            .onUpdate(function(){
                element.setPosition(this.x, this.y, this.z);
            })
           .easing(commands[1].easing);

       for(var i = 2; i< commands.length; i++){
           tweens[i-1] = new TWEEN.Tween(commands[i-1].position)
               .delay(commands[i].delay)
               .to(commands[i].position, commands[i].duration)
                .onUpdate(function(){
                    element.setPosition(this.x, this.y, this.z);
                })
               .easing(commands[i].easing);
           tweens[i-2].chain(tweens[i-1]);
       }

       /* this is broken but I don't really care. it works for long enough */
       if(repeat){
           tweens[tweens.length-1].chain(tweens[0]);
       }
       return tweens[0];
    }

    function setPanelPositions(intro){
        for(var i = 0; i< carouselPanels.length; i++){
            if(intro && i > 0 && i < carouselPanels.length-1){
                continue;
            }
            var panel = carouselPanels[i];
            var newY = Math.max(carouselCenter.y + screenScale*180 * Math.sin(Math.PI * 2 * (i / carouselPanels.length) + Math.PI * 2 * (carouselLocation + .58)), 310 * screenScale);
            // var newX = 1300 + 300 * Math.cos(Math.PI * 2 * (i / carouselPanels.length) + Math.PI * 2 * (carouselLocation + .58));
            
            var newX = carouselCenter.x + (renderWidth/3) * Math.cos(Math.PI * 2 * (i / carouselPanels.length) + Math.PI * 2 * (carouselLocation + .58));
            var newZ = Math.max(0, Math.min(1, 1.1 * Math.sin(Math.PI * 2 * (i / carouselPanels.length) + Math.PI * 2 * (carouselLocation) + 1.2)));
            carouselPanels[i].setPosition(newX, newY, newZ);
        }
    }

    function tinyPanelTween(panel, startx, startz){
        var newX = Math.random() * 1200 * screenScale;
        var newZ = Math.random() * .5;

        new TWEEN.Tween({x: startx, z: startz})
            .to({x: newX, z: newZ}, 2000)
            .delay(Math.random() * 10000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function(){
                panel.setPosition(this.x, undefined, this.z);
            })
            .onComplete(function(){
                tinyPanelTween(panel, newX, newZ);
            }).start();
    }

    function runIntroAnimation(){
        /* Background */
        new TWEEN.Tween({level: .1})
           .to({level: 1}, 3000)
           .easing(TWEEN.Easing.Quadratic.Out)
           .onUpdate(function(){
               backgroundPanel.setLightBarLevel(this.level);
               backgroundPanel.setOverheadLightLevel(this.level);
               subjectPanel.setBrightness(this.level);
               bottomPanel.element.css({opacity: this.level});

           }).start();


        /* Name Panel */
        createChainedTween(namePanel, [
            {position: {x: renderWidth, z:0}},
            {   delay: 0, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 500 * screenScale, z:.2}
            },
            {   delay: 0, 
                duration: 1000, 
                easing: TWEEN.Easing.Back.Out,
                position: {x: 500 * screenScale, z:1}
            },
            {   delay: 2000, 
                duration: 2000, 
                easing: TWEEN.Easing.Back.Out,
                position: {x: 200 * screenScale}
            },
            {   delay: 4000, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 50 * screenScale}
            },
        ]
        ).start();

        createChainedTween(namePanel, [
            {position: {y: renderHeight}},
            {   delay: 200, 
                duration: 2200, 
                easing: TWEEN.Easing.Back.InOut,
                position: {y: 340 * screenScale}
            },
            {   delay: 0, 
                duration: 1200, 
                easing: TWEEN.Easing.Back.Out,
                position: {y: 350 * screenScale}
            },
            {   delay: 2000, 
                duration: 2000, 
                easing: TWEEN.Easing.Back.Out,
                position: {y: 360 * screenScale}
            },
            {   delay: 4000, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {y: 358 * screenScale}
            },
        ]
        ).start();

        /* Share Panel */

        createChainedTween(sharePanel, [
            {position: {x: renderWidth + 100, z:0}},
            {   delay: 500, 
                duration: 1000, 
                easing: TWEEN.Easing.Quintic.Out,
                position: {x: renderWidth - 200 * screenScale, z:0}
            },
            {   delay: 1000, 
                duration: 3000, 
                easing: TWEEN.Easing.Quadratic.InOut,
                position: {x: 20 * screenScale, z: 1}
            },
        ]
        ).start();

        createChainedTween(sharePanel, [
            {position: {y: renderHeight - 120 * screenScale}},
            {   delay: 500, 
                duration: 1000, 
                easing: TWEEN.Easing.Back.Out,
                position: {y: renderHeight - 150 * screenScale}
            },
            {   delay: 0, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {y: renderHeight - 20 * screenScale}
            },
        ]
        ).start();

        /* carousel */

        new TWEEN.Tween({pos: -.5})
            .delay(10000)
            .to({pos: 0}, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function(){
                carouselLocation = this.pos;
                setPanelPositions(true);
            }).start();

        /* tiny panel 1 */
        tinyPanelTween(tinyPanel1, 2024 * screenScale, .5);
        tinyPanelTween(tinyPanel2, -2024 * screenScale, .5);
        tinyPanelTween(tinyPanel3, 2024 * screenScale, .5);
        tinyPanelTween(tinyPanel4, 2024 * screenScale, .5);
        tinyPanelTween(tinyPanel5, 2024 * screenScale, .5);

        /*
        new TWEEN.Tween({x: 1024 * screenScale-.5})
            .delay(10000)
            .to({pos: 0}, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function(){
                carouselLocation = this.pos;
                setPanelPositions(true);
            }).start();
           */


            /*

        createChainedTween(tinyPanel1, [
            {position: {x: 1024 * screenScale, z: .5}},
            {   delay: 500, 
                duration: 2000, 
                easing: TWEEN.Easing.Back.Out,
                position: {x: 500 * screenScale, z: .5}
            },
            {   delay: 1000, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 1024 * screenScale, z: .5}
            },
            {   delay: 3000, 
                duration: 3000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 1200 * screenScale, z: 0}
            },
            {   delay: 5000, 
                duration: 3000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 200 * screenScale, z: .8}
            },
            {   delay: 2000, 
                duration: 2000, 
                easing: TWEEN.Easing.Back.Out,
                position: {x: 500 * screenScale, z: .5}
            },
            {   delay: 5000, 
                duration: 2000, 
                easing: TWEEN.Easing.Quintic.InOut,
                position: {x: 1024 * screenScale, z: .5},
            },
        ], true).start();
       */

        /* start the clock after everything has finished loading */


        /*
        var nameIntroTween = new TWEEN.Tween({x: renderWidth *.8, y: renderHeight / 2, z: 0})
            // .delay(1000)
            .to({x: renderWidth/2 + 20*screenScale, y: renderHeight/2 + 20*screenScale, z:1}, 2000)
            .onUpdate(function(){
                namePanel.setPosition(this.x, this.y, this.z);
            })
            .easing(TWEEN.Easing.Quintic.Out);

        var nameIntroTween = new TWEEN.Tween({x: renderWidth/2 + 20 *.8, y: renderHeight / 2, z: 0})
            // .delay(1000)
            .to({x: renderWidth/2 + 20*screenScale, y: renderHeight/2 + 20*screenScale, z:1}, 2000)
            .onUpdate(function(){
                namePanel.setPosition(this.x, this.y, this.z);
            })
            .easing(TWEEN.Easing.Quintic.Out);


        nameIntroTween.start();
       */
    }

    /* register what to do while loading */

    LOADSYNC.onUpdate(function(completedCount, totalCount){
        $(".cassette-tape").velocity("stop");
        $(".cassette-tape").velocity({"margin-left": 45 * completedCount / totalCount}, 1000);
    });

    /* register what we want to do when loading is complete */
    LOADSYNC.onComplete(function(){
        $("#loading-graphic").velocity({color: "#000", opacity: 0},{"display":"none"});
        runIntroAnimation();
        setTimeout(function(){clock.start()}, 6000);
        // clock.start();
    });


    function render(){
        var time = clock.getElapsedTime();
        stats.update();
        backgroundPanel.render(time);

        // skeletonPanel.quad.position.x = projectorPanel.width / 2 + Math.sin(time/2) * 300;
        skeletonPanel.render(time);
        namePanel.render(time);
        sharePanel.render(time);
        tinyPanel1.render(time);
        tinyPanel2.render(time);
        tinyPanel3.render(time);
        tinyPanel4.render(time);
        tinyPanel5.render(time);

        for(var i = 0; i < carouselPanels.length; i++){
            if(carouselPanels[i].quad.position.x < renderWidth + 200){
                carouselPanels[i].render(time);
            }
        }

        projectorPanel.render(time);
        subjectPanel.render();

        renderer.render(scene, camera);

        TWEEN.update();

        requestAnimationFrame(render);

    }

    render();

    $(window).resize(function() {
        if($(window).width() > renderWidth * 1.3 || $(window).width() < renderWidth * .7){
            location.href = '?';
            return;
        }
        $('canvas').width($(window).width());
        $('canvas').height($(window).width() / screenRatio);
    });

    $(document).on("mousedown","canvas", function(event){
        
        // Do Dragging
        //
        // namePanel.quad.position.set(event.clientX, 580-event.clientY - namePanel.height / 2, 0);

        if(event.clientY > 250 && event.clientY < 450 && event.clientX > 850){

            carouselGrabbed = true;
            $(event.target).addClass("grabbing");
            grabStart = {x: event.clientX, y: event.clientY};
            return;
        }

        for(var i = 0; i< interactivePanels.length; i++){
            var panel = interactivePanels[i];
            var boundRes = panel.checkBounds(event.clientX,renderHeight - event.clientY - canvasTop);
            if(typeof boundRes == "string"){
                location.href=boundRes;
                return;

            } else if(boundRes){
                grabbedPanel = panel;
                grabStart = {x: event.clientX, y: event.clientY};
                $(event.target).removeClass("pointing");
                $(event.target).addClass("grabbing");
                return;
            }
        }

    });

    $(document).on("mouseup","canvas", function(event){
        carouselGrabbed = false;
        grabbedPanel = null;
        grabStart = null;
        $(event.target).removeClass("pointing");
        $(event.target).removeClass("grabbing");
    });

    $(document).on("mouseout","canvas", function(event){
        carouselGrabbed = false;
        grabbedPanel = null;
        grabStart = null;
        $(event.target).removeClass("pointing");
        $(event.target).removeClass("grabbing");
    });

    $(document).on("scroll", function(){
        carouselLocation = $(document).scrollTop() /  ($(document).height() - window.innerHeight);
        setPanelPositions();
    });

    function getScale(y){
        return 1 - (y-250)/400;
    }

    function getBlur(y){
        return 1-(y-250)/200;
    }




    $(document).on("mousemove","canvas", function(event){
        // check to see what object i'm in...

        
        if(grabbedPanel){

            grabbedPanel.quad.position.x = grabbedPanel.quad.position.x - (grabStart.x - event.clientX); 
            grabbedPanel.quad.position.y = grabbedPanel.quad.position.y + (grabStart.y - event.clientY); 

            grabStart.x = event.clientX;
            grabStart.y = event.clientY;

            return;

        } else if (carouselGrabbed){

            carouselLocation = (carouselLocation + 1.0 + (event.clientX - grabStart.x) / 1000) % 1.0;

            grabStart.x = event.clientX;
            grabStart.y = event.clientY;

            setPanelPositions();

            return;

        }

        if(event.clientY > 250 && event.clientY < 450 && event.clientX > 850){
            $(event.target).addClass("grab");
            return;
        }


        for(var i = 0; i< interactivePanels.length; i++){
            var panel = interactivePanels[i];
            var boundRes = panel.checkBounds(event.clientX,renderHeight - event.clientY + canvasTop);
            if(typeof boundRes == "string"){
                $(event.target).removeClass("grab");
                $(event.target).addClass("pointing");
                clickStart = boundRes;
                return;

            } else if(boundRes){
                $(event.target).addClass("grab");
                $(event.target).removeClass("pointing");
                return;
            }
        }
        $(event.target).removeClass("pointing");
        $(event.target).removeClass("grab");
        // $(event.target).css("cursor", "inherit")

    });

    /*
    new TWEEN.Tween({loc: -.1})
                .delay(1000)

                .to({loc: 0}, 2000)
                .onUpdate(function(){
                    carouselLocation = this.loc;
                    setPanelPositions();
                })
                .easing(TWEEN.Easing.Elastic.Out)
                .start();
               */

    function setTwitter(){

        $.getJSON('http://cdn.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(document.URL) + '&callback=?', null, function (results) {
            if(typeof results.count == "number"){
                sharePanel.setTweets(results.count);
            }
        });
    }

    function setGithub(){

        $.getJSON('https://api.github.com/repos/arscan/lineup', null, function (results) {
            if(typeof results.stargazers_count == "number"){
                sharePanel.setStars(results.stargazers_count);
            }
        });
    }


    setTwitter();
    setGithub();
    LOADSYNC.start();

}

$(function(){
    var bgHeight = 1600, 
        skipRotate = false,
        rotateCheckTimeout = null,
        isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

    function isPortrait(){
        return ( isMobile && $(window).width() < $(window).height());
    }

    function load(){
        if(!isPortrait() || skipRotate){
            $("body").height(4000);
            $("#please-rotate").css({"display": "none"});
            WebFont.load({
                google: {
                    families: ['Roboto:500']
                },
                active: function(){
                    if(isMobile){
                        $("#play-button").click(function(){
                            var video = $("#video")[0];
                            video.src = "videos/test_vid.webm";
                            video.setAttribute('crossorigin', 'anonymous');
                            video.load(); // must call after setting/changing source
                            video.play();
                            main($(window).width());

                            $("#play-button").velocity({opacity: 0}, {complete: function(){
                                $("#play-button").css({display: "none"});
                            }});
                        });
                    } else {
                        var video = $("#video")[0];
                        video.src = "videos/test_vid.webm";
                        video.setAttribute('crossorigin', 'anonymous');
                        video.load(); // must call after setting/changing source
                        video.play();
                        main($(window).width());
                    }
                }
            }); 
        } else {
            $("#please-rotate").css({"display": "block"});
            rotateCheckTimeout = setTimeout(load, 500);
        }
    }


    $("#please-rotate").click(function(){
        clearTimeout(rotateCheckTimeout);
        skipRotate = true;
        load();
    });

    if(!isMobile){
        $("#play-button").css({display: "none"});
    }

    load();
});

/*
    $('body').height( bgHeight + $(window).height() );
    $(window).scroll(function() {
        if ( $(window).scrollTop() >= ($('body').height() - $(window).height()) ) {
            $(window).scrollTop(1);
        }
        else if ( $(window).scrollTop() == 0 ) {
            $(window).scrollTop($('body').height() - $(window).height() -1);
        }    
    });
*/

/*
$(window).resize(function() {
    $('body').height( bgHeight + $(window).height() );
});
*/
