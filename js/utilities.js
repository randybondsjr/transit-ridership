function updateClock() {
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentSeconds = currentTime.getSeconds();

    // Pad the minutes and seconds with leading zeros, if required
    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
    currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

    // Choose either "AM" or "PM" as appropriate
    var timeOfDay = (currentHours < 12) ? "AM" : "PM";

    // Convert the hours component to 12-hour format if needed
    currentHours = (currentHours > 12) ? currentHours - 12 : currentHours;

    // Convert an hours component of "0" to "12"
    currentHours = (currentHours == 0) ? 12 : currentHours;

    // Compose the string for display
    var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;


    $("#clock").html(currentTimeString);

}

$(document).ready(function() {
    setInterval('updateClock()', 1000);
    $(".touchspin").TouchSpin();
    $('#cashAdult,#cashYouth,#cashReduced,#child,#ticketAdult,#ticketYouth,#ticketReduced,#transfer,#passAdult,#passYouth,#passReduced,#passengerExited').change(function() {
        var audio = document.getElementById("clickSound");
        audio.play();
    });
    //update costs on key input
    $('#cashAdult,#cashYouth,#cashReduced,#child,#ticketAdult,#ticketYouth,#ticketReduced,#transfer,#passAdult,#passYouth,#passReduced').change(function() {
        updateTotal();
    });

    var updateTotal = function() {
            var input1 = (isNaN(input1 = parseInt($("#cashAdult").val(), 10)) ? 0 : input1);
            var input2 = (isNaN(input2 = parseInt($("#cashYouth").val(), 10)) ? 0 : input2);
            var input3 = (isNaN(input3 = parseInt($("#cashReduced").val(), 10)) ? 0 : input3);
            var input4 = (isNaN(input4 = parseInt($("#child").val(), 10)) ? 0 : input4);
            var input5 = (isNaN(input5 = parseInt($("#ticketAdult").val(), 10)) ? 0 : input5);
            var input6 = (isNaN(input6 = parseInt($("#ticketYouth").val(), 10)) ? 0 : input6);
            var input7 = (isNaN(input7 = parseInt($("#ticketReduced").val(), 10)) ? 0 : input7);
            var input8 = (isNaN(input8 = parseInt($("#transfer").val(), 10)) ? 0 : input8);
            var input9 = (isNaN(input9 = parseInt($("#passAdult").val(), 10)) ? 0 : input9);
            var input10 = (isNaN(input10 = parseInt($("#passYouth").val(), 10)) ? 0 : input10);
            var input11 = (isNaN(input11 = parseInt($("#passReduced").val(), 10)) ? 0 : input11);

            $('#totalRiders').val(input1 + input2 + input3 + input4 + input5 + input6 + input7 + input8 + input9 + input10 + input11);
            $('#totalRidersView').val(input1 + input2 + input3 + input4 + input5 + input6 + input7 + input8 + input9 + input10 + input11);

        };

    //update cost on load
    updateTotal();

    //toggle value for attributes
    $("#bicycle").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#bike").val() == 0) {
            $("#bike").val("1");
        } else {
            $("#bike").val("0");
        }
    });

    $("#btn-wheelchair").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#wheelchair").val() == 0) {
            $("#wheelchair").val("1");
        } else {
            $("#wheelchair").val("0");
        }
    });

    $("#btn-stroller").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#stroller").val() == 0) {
            $("#stroller").val("1");
        } else {
            $("#stroller").val("0");
        }
    });

    $("#btn-walker").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#walker").val() == 0) {
            $("#walker").val("1");
        } else {
            $("#walker").val("0");
        }
    });

    $("#btn-serviceAnimal").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#serviceAnimal").val() == 0) {
            $("#serviceAnimal").val("1");
        } else {
            $("#serviceAnimal").val("0");
        }
    });

    $("#btn-child").on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass("btn-danger");
        $(this).toggleClass("btn-default");
        if ($("#child").val() == 0) {
            $("#child").val("1");
        } else {
            $("#child").val("0");
        }
    });

});