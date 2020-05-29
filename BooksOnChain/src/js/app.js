App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        const q = window.location.search;
        const params = new URLSearchParams(q);

        const book = params.get("sources");
        $.getJSON('../bookslots.json', function(data) {
            var booksRow = $('#booksRow');
            var bookTemplate = $('#bookTemplate');

            for (i = 0; i < data.length; i++) {
                if(book == data[i].name){
                    bookTemplate.find('.card-title').text(data[i].name);
                    bookTemplate.find('img').attr('style', data[i].picture);
                    bookTemplate.find('.book-owner').text(data[i].owner);
                    bookTemplate.find('.book-telephone').text(data[i].telephone);
                    bookTemplate.find('.book-isbn').text(data[i].isbn);
                    bookTemplate.find('.btn-book').attr('data-id', data[i].id);
                    booksRow.append(bookTemplate.html());
                }
            }
        });

        return await App.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                
                await window.ethereum.enable();
            } catch (error) {
                
                console.error("User denied account access")
            }
        }
        
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function() {
        $.getJSON('Book.json', function(data) {
            
            var BookArtifact = data;
            App.contracts.Book = TruffleContract(BookArtifact);

            
            App.contracts.Book.setProvider(App.web3Provider);

            
            return App.markBooked();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-book', App.handleBook);
        $(document).on('click', '.btn-large', App.init);
    },

    markBooked: function(bookers, account) {
        const q = window.location.search;
        const params = new URLSearchParams(q);

        const book = params.get("sources");
        var bookInstance;

        App.contracts.Book.deployed().then(function(instance) {
            bookInstance = instance;

            return bookInstance.getBookers.call();
        }).then(function(bookers) { 
            len = $('.panel-book').find('button').find('data-id').prevObject.length
            for (i = 0; i < len; i++) {
                if ((bookers[$('.panel-book').find('button').find('data-id').prevObject[i].getAttribute('data-id')] !== '0x0000000000000000000000000000000000000000')) {
                        $('.panel-book').eq(i).find('button').text(bookers[$('.panel-book').find('button').find('data-id').prevObject[i].getAttribute('data-id')]).attr('disabled', true);
                }
            }
        }).catch(function(err) {
            console.log(err.message);
        });

    },

    handleBook: function(event) {
        event.preventDefault();

        var bookId = parseInt($(event.target).data('id'));

        var bookInstance;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Book.deployed().then(function(instance) {
                bookInstance = instance;

                
                return bookInstance.book(bookId, {
                    from: account
                });
            }).then(function(result) {
                return App.markBooked();
            }).catch(function(err) {
                console.log(err.message);
            });
        });

    }

};

$(function() {
    $(window).load(function() {
        App.init();
    });
});

$(".custom-select").each(function() {
    var classes = $(this).attr("class"),
        id      = $(this).attr("id"),
        name    = $(this).attr("name");
    var template =  '<div class="' + classes + '">';
        template += '<span class="custom-select-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        $(this).find("option").each(function() {
          template += '<span class="custom-option ' + $(this).attr("class") + '" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
        });
    template += '</div></div>';
    
    $(this).wrap('<div class="custom-select-wrapper"></div>');
    $(this).hide();
    $(this).after(template);
  });
  $(".custom-option:first-of-type").hover(function() {
    $(this).parents(".custom-options").addClass("option-hover");
  }, function() {
    $(this).parents(".custom-options").removeClass("option-hover");
  });
  $(".custom-select-trigger").on("click", function() {
    $('html').one('click',function() {
      $(".custom-select").removeClass("opened");
    });
    $(this).parents(".custom-select").toggleClass("opened");
    event.stopPropagation();
  });
  $(".custom-option").on("click", function() {
    $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
    $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
    $(this).addClass("selection");
    $(this).parents(".custom-select").removeClass("opened");
    $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
  });