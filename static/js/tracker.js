$(document).ready(function(){

    $("#preloader-form").hide();
    $("#progress").hide();
    $('#menu-up').show();

    $('.dropdown-sites').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true // Displays dropdown below the button
    });

    var cardHtml = function (cover_image_url, release_day, title, series_ID, current_episode, stream_site) {
        var mainBody = '<div series-id="' + series_ID + '" title="' + title + '">' +
            '<button class="waves-effect waves-light btn ep-done  deep-orange lighten-1" series-id="' + series_ID + '">#' +
            '<strong id="ep-number-' + series_ID + '">' + current_episode + '</strong><i class="material-icons left">done</i></button>' +
            '<span>midnight</span>';
        if (stream_site != '') {
            mainBody += '<a href="/tracker/watch_episode/' + series_ID + '" class="waves-effect waves-light btn deep-orange lighten-1 right" series-id="' + series_ID + '">' +
                '<i class="material-icons">play_arrow</i></a>' +
                '<li class="collection-item avatar" series-id="' + series_ID + '">' +
                ' <img src="' + cover_image_url + '" alt="" class="circle">' +
                '<span class="title">' + title + '</span>' +
                '<p>' + release_day + '</p>' +
                '<div class="secondary-content"><a class="waves-effect waves-light btn-flat settings-trigger" ' +
                'series-id="' + series_ID + '"><i class="material-icons gray">settings</i></a></li></div>';
        }
        else {
            mainBody += '<a href="/tracker/watch_episode/' + series_ID + '" class="waves-effect waves-light btn-flat right" series-id="' + series_ID + '">' +
                '<i class="material-icons">play_arrow</i></a>' +
                '<li class="collection-item avatar" series-id="' + series_ID + '">' +
                ' <img src="' + cover_image_url + '" alt="" class="circle">' +
                '<span class="title">' + title + '</span>' +
                '<p>' + release_day + '</p>' +
                '<div class="secondary-content"><a class="waves-effect waves-light btn-flat settings-trigger" ' +
                'series-id="' + series_ID + '"><i class="material-icons gray">settings</i></a></li></div>';
        }

        return mainBody;
};
    var leftContentCount = 0;
    var rightContentCount = 0;
    var loadMainContent = function (sort) {
        var altBool = true;
        $.ajax({
            url: '/tracker/get_series_as_json/?sort=' + sort,
            type: 'GET',
            data: {csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value},
            dataType: 'json',
            success: function (response) {
                $('#series-deck').html('<ul class="collection" id="card-list"></ul>');
                $('#series-deck2').html('<ul class="collection" id="card-list2"></ul>');
                for (var key in response) {
                    if (response.hasOwnProperty(key)) {
                        var series = response[key];
                        var fullHtml = cardHtml(series.cover_image_url, series.release_day, series.title, series.id,
                            series.current_episode, series.stream_site);
                        if (altBool) {
                            $('#card-list').append(fullHtml);
                            leftContentCount++;
                            altBool = false;
                        } else {
                            $('#card-list2').append(fullHtml);
                            rightContentCount++;
                            altBool = true;
                        }
                    }
                }

            },
            error: function (response) {
                console.log(response);
            }

        });
    };

    loadMainContent('All');

    $(document.body).on('click', '#sort-today', function (e) {
        e.preventDefault();
        var dayArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        var day = new Date().getDay();
        loadMainContent(dayArray[day]);
    });
    $(document.body).on('click', '#sort-all', function (e) {
        e.preventDefault();
        loadMainContent('All');
    });

    $('#add_series_button').on('click', function () {
        $('.dropdown-sites').dropdown({belowOrigin: true});
        // Get favorite websites and load into dropdown
        $.ajax({
            url: '/tracker/get_favorite_sites/',
            type: 'GET',
            success: function (response) {
                $.each(response, function (index, value) {
                    $('#fav-sites-dropdown').append('<li class="fav-item"><a href="#!">' + value + '</a></li>');
                });
                $('.fav-item').on('click', function () {
                    $('#stream_site_id').val($(this).html().replace('<a href="#!">', '').replace('</a>', ''));
                });
            },
            error: function (response) {
                alert(response);
                console.log(response);
            }
        });
        // Tag suggestions
        var tag_list = ['anime', 'tv series', 'manga'];
        $('.dropdown-tag').dropdown({belowOrigin: true});
        for (var i = 0; i < tag_list.length; i++) {
            $('#tags-dropdown').append('<li><a class="tag-item" href="#!">' + tag_list[i] + '</a></li>');
        }
        $('.tag-item').on('click', function (e) {
            e.preventDefault();
            $('.dropdown-tag').focus();
            $('.dropdown-tag').val($(this).html());
        });

    });


    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    if (dir === '/tracker/watch_episode') {
        $('#floaty-side-nav').append('<li><a href="/tracker/" class="waves-effect waves-circle waves-light btn-floating blue" id="home"><i class="material-icons">home</i></a></li>');
        $('#menu-up').hide();
    }

    var reloadCard = function (PK) {
        $.ajax({
            dataType: 'json',
            url: '/tracker/get_a_series/?pk=' + PK,
            data: {csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value},
            success: function (response) {
                $('div[series-id="' + PK + '"]').html(cardHtml(response.cover_image_url, response.release_day, response.title,
                    response.id, response.current_episode, response.stream_site));
            },
            error: function (response) {
                console.log(response);
                alert('Error updating card');
            }
        });
    };

    $(document.body).on("click", '.ep-done', function () {
        var pk = $(this).attr("series-id");

        $.ajax({
            url: "/tracker/watched/" + pk,
            type: "GET",
            data: {pk: pk},
            success: function (response) {
                $("#ep-number-" + pk).html(response)
            }
        });
    });

    $(document.body).on('click', '.clear-button', function (e) {
        e.preventDefault();
        reloadCard($(this).attr('series-ID'));
    });

    $(document.body).on('click', '.settings-trigger', function () {
        var series_ID = $(this).attr('series-id');
        $('li[series-id=' + series_ID + ']').html(
            '<a href="#" class="waves-effect waves-light btn btn-floating right clear-button" series-id="' + series_ID + '">' +
            '<i class="material-icons">undo</i></a></br>' +
            '<a class="waves-effect waves-light btn update-form" ' +
            'pk="' + series_ID + '"><i class="material-icons">edit</i></a>' +
            '<a href="#" class="waves-effect waves-light btn"><i class="material-icons">share</i></a>' +
            '<a class="waves-effect waves-light btn series-delete red" series-id="' + series_ID + '">' +
            '<i class="material-icons">delete</i></a>');
    });


    $(document.body).on("click", '.series-delete', function () {
        var pk = $(this).attr("series-id");

        $.ajax({
    url: "/tracker/delete/" + pk,
    type: "GET",
    data: {pk: pk},
    success: function(response){
        $('div[series-id=' + pk + ']').remove();
        $('li[series-id=' + pk + ']').remove();
      Materialize.toast('<span>' + response + ' deleted.</span>', 4000);
    }
        });
    });

    var form = $('#add-form');
    form.submit(function (e) {
        e.preventDefault();
        $('#error-message').empty();
        $('#add-series-button').hide();
        $("#preloader-form").show();
        $.ajax({
            dataType: 'json',
            url: '/tracker/add/',
            type: 'POST',
            data: form.serialize(),
            success: function (response) {
                if (response[0] == 'error') {
                    $('#add-series-button').show();
                    $("#preloader-form").hide();
                    var errorDict = {'release_day': 'Day', 'tag': 'Tag', 'title': 'Title'};
                    $('#error-message').empty();
                    for (var i = 0; i < response.errors.length; i++) {

                        $('#error-message').append('<li class="collection-item">' + errorDict[response.errors[i]] + ' is required.</li>');
                    }
                    $('#add_series_modal').animate({scrollTop: 0}, 'slow');
                }
                else {
                    $('#add-form').trigger('reset');
                    $("#preloader-form").hide();
                    $("#add_series_modal").closeModal();
                    $('#add-series-button').show();
                    var series = response[0];
                    if (leftContentCount <= rightContentCount) {
                        $('#card-list').append(cardHtml(series.cover_image_url, series.release_day, series.title, series.id,
                            series.current_episode, series.stream_site));
                        leftContentCount++;
                    }
                    else {
                        $('#card-list2').append(cardHtml(series.cover_image_url, series.release_day, series.title, series.id,
                            series.current_episode, series.stream_site));
                        rightContentCount++;
                    }
                    Materialize.toast('<span>' + series.title + ' added.</span>', 4000);

                }
            },
            error: function (response) {
                $("#preloader-form").hide();
                $('#add-series-button').show();
                console.log(response);
                alert("Something went wrong.");
            }

        });
    });

    $(document.body).on('click', '.update-form', function (e) {
    e.preventDefault();
    var updateSeriesPK = $(this).attr('pk');
        var title = $('div[series-id="' + updateSeriesPK + '"]').attr('title');
    $.get('/tracker/update/' + updateSeriesPK, function(data){
      $('#update-series-modal-content').html(data);
      $('select').material_select();
      $('#update-button').html('<i class="material-icons">check</i>');
      $('#update-series-modal').openModal();
      $('input').focus();
      $('#update-series-form').on('submit', function(e) {
            e.preventDefault();
          $('#update-button').hide();
            $.ajax({
              url: '/tracker/update/' + updateSeriesPK,
              type: 'POST',
              data: $('#update-series-form').serialize(),
              success: function(response){
                if(response.includes('collection-item')){
                  $('#update-button').show();
                  $('#error-div').html($(response).find('.collection').html());
                }
                else{
                  $('#update-series-modal').closeModal();
                  reloadCard(updateSeriesPK);
                  Materialize.toast('<span>' + title + ' updated.</span>', 4000);
                }
              },
              error: function(response){
                $('#update-button').show();
                alert('Error');
              }
            });
        });
      
    });
});


$('#favorite_link').on('click', function(e) {
    e.preventDefault();
    var site_url = $('#stream_site_id').val();
    if (site_url.length > 7 && site_url.includes("http://")){
      $.ajax({
        url: '/tracker/favorite_site/?site=' + site_url,
        type: 'POST',
        data: {csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value},
        success: function(response){
          $('#add_fav_link').html('done')
        },
        error: function(response){
          alert(response);
          console.log(response);
        }
      });
    }
    else{
      alert('Site url should include "http://"')
    }
});



});


