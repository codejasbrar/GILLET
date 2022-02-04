(function($){

    'use strict';

    $.widget('ui.productGallery', {
        options: {
            id: 1,
            single: false,
            media_id_index: [],
            gallery_has_video: false,
            video_autoplay: true,
            grouped: false,
            enable_zoom: false,
            zoom_scale_coef: theme.product.gallery_zoom_scale_coef || 3,
            zoom_offset_coef: 0.75,
            main: {
                enabled: false,
                device: 'all',
                stretch_size: 'auto',
                slick: {
                    lazyLoad: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: true,
                    infinite: false,
                    touchMove: false,
                    adaptiveHeight: true,
                    rtl: theme.rtl
                }
            },
            thumbnail: {
                enabled: false,
                device: 'desktop',
                slick: {
                    lazyLoad: false,
                    vertical: true,
                    verticalSwiping: true,
                    slidesToShow: 6,
                    slidesToScroll: 6,
                    dots: false,
                    arrows: true,
                    infinite: false,
                    touchMove: false,
                    responsive: [
                        {
                            breakpoint: 1259,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4
                            }
                        },
                        {
                            breakpoint: 1025,
                            settings: {
                                vertical: false,
                                verticalSwiping: false,
                                slidesToShow: 5,
                                slidesToScroll: 5,
                                arrows: false
                            }
                        }
                    ]
                }
            },
            collage: {
                enabled: false,
                device: 'desktop'
            },
            sheet: {
                enabled: false,
                device: 'desktop'
            },
            fullscreen: {
                enabled: false,
                device: 'desktop',
                slick: {
                    lazyLoad: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: true,
                    infinite: false,
                    touchMove: false,
                    adaptiveHeight: false,
                    rtl: theme.rtl
                }
            }
        },
        _create: function() {
            var _ = this,
                $popup = $('.js-popup.active');

            this.$gallery = this.element;
            this.$main_slider = this.$gallery.find('[data-js-product-gallery-main-slider]');

            this.$scroll_elem = $popup.length ? $popup : $window;

            var options_global = this.$gallery.find('[data-json-options-global]'),
                options_layout = this.$gallery.find('[data-json-options-layout]');

            options_global = options_global.length ? JSON.parse(options_global.html()) : {};
            options_layout = options_layout.length ? JSON.parse(options_layout.html()) : {};

            this.options = $.extend(true, {}, this.options, options_global, options_layout);
            this.main_slides = [];
            this.indexes = [];

            $.each(this.options.media_id_index, function (i) {
                _.indexes.push(i);
            });

            if(this.options.grouped) {
                this.indexes_cache = this.indexes;
            }

            if(this.options.gallery_has_video) {
                this.$control_gallery = this.$gallery.find('[data-js-product-gallery-control-video]');

                this._loadMedia = function (slides_namespace, index) {
                    var $model;

                    if(this[slides_namespace][this.indexes[index]].$video && !this[slides_namespace][this.indexes[index]].$video[0].hasAttribute('src')) {
                        this[slides_namespace][this.indexes[index]].$video.attr('poster', this[slides_namespace][this.indexes[index]].$video.attr('data-poster'));
                        this[slides_namespace][this.indexes[index]].$video.attr('src', this[slides_namespace][this.indexes[index]].$video.find('source').first().attr('data-src'));
                    } else if(this[slides_namespace][this.indexes[index]].$iframe && !this[slides_namespace][this.indexes[index]].$iframe.hasClass('loaded')) {
                        this[slides_namespace][this.indexes[index]].$iframe.addClass('loading').one('load', function () {
                            $(this).addClass('loaded').removeClass('loading');
                        }).attr('src', this[slides_namespace][this.indexes[index]].$iframe.attr('data-src'));
                    } else if(this[slides_namespace][this.indexes[index]].$template && !this[slides_namespace][this.indexes[index]].$template[0].hasAttribute('src')) {
                        $model = $(this[slides_namespace][this.indexes[index]].$template[0].content).children().first();

                        if(this[slides_namespace][this.indexes[index]].$blockratio) {
                            this[slides_namespace][this.indexes[index]].$blockratio.find('[data-js-product-gallery-blockratio-content]').html('');
                            this[slides_namespace][this.indexes[index]].$blockratio.find('[data-js-product-gallery-blockratio-content]').append($model);
                        } else {
                            this[slides_namespace][this.indexes[index]].$item.html('');
                            this[slides_namespace][this.indexes[index]].$item.append($model);
                        }

                        this[slides_namespace][this.indexes[index]].$model = $model;
                        this[slides_namespace][this.indexes[index]].$template = null;
                    }
                };

                this._playVideo = function ($video) {
                    if(!$video.hasClass('playing')) {
                        $video.addClass('playing')[0].play();
                    }
                };

                this._pauseVideo = function ($video) {
                    if($video.hasClass('playing')) {
                        $video.removeClass('playing')[0].pause();
                    }
                };

                this._playIframe = function ($iframe) {
                    if(!$iframe.hasClass('playing')) {
                        $iframe.addClass('playing')[0].contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
                    }
                };

                this._pauseIframe = function ($iframe) {
                    if($iframe.hasClass('playing')) {
                        $iframe.removeClass('playing')[0].contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
                    }
                };

                this.switchMedia = function (slides_namespace, index, action) {
                    if(action === 'play' && this.options.video_autoplay) {
                        if(this[slides_namespace][this.indexes[index]].$video && (this[slides_namespace][this.indexes[index]].$video[0].hasAttribute('src') || this[slides_namespace][this.indexes[index]].$video.find('source').first()[0].hasAttribute('src'))) {
                            this._playVideo(this[slides_namespace][this.indexes[index]].$video);
                        } else if(this[slides_namespace][this.indexes[index]].$iframe) {
                            if(this[slides_namespace][this.indexes[index]].$iframe.hasClass('loaded')) {
                                this._playIframe(this[slides_namespace][this.indexes[index]].$iframe);
                            } else if(this[slides_namespace][this.indexes[index]].$iframe.hasClass('loading')) {
                                this[slides_namespace][this.indexes[index]].$iframe.one('load', function () {
                                    _._playIframe(_[slides_namespace][_.indexes[index]].$iframe);
                                });
                            } else if(this[slides_namespace][this.indexes[index]].$iframe[0].hasAttribute('src')) {
                                this._playIframe(this[slides_namespace][this.indexes[index]].$iframe);
                            }
                        }
                    } else if(action === 'pause') {
                        if(this[slides_namespace][this.indexes[index]].$video && this[slides_namespace][this.indexes[index]].$video[0].hasAttribute('src')) {
                            this._pauseVideo(this[slides_namespace][this.indexes[index]].$video);
                        } else if(this[slides_namespace][this.indexes[index]].$iframe) {
                            if(this[slides_namespace][this.indexes[index]].$iframe.hasClass('loaded')) {
                                this._pauseIframe(this[slides_namespace][this.indexes[index]].$iframe);
                            } else if(this[slides_namespace][this.indexes[index]].$iframe.hasClass('loading')) {
                                this[slides_namespace][this.indexes[index]].$iframe.one('load', function () {
                                    _._pauseIframe(_[slides_namespace][_.indexes[index]].$iframe);
                                });
                            }
                        }
                    }
                };
            }

            if(this.options.enable_zoom) {
                this._initZoom = function () {
                    $window.on('mousemove.productgallery.' + this.options.id, function (e) {
                        _.cursor = {
                            clientY: e.clientY,
                            clientX: e.clientX
                        };
                    });

                    this._getZoomObj = function () {
                        _.zooms = [];

                        var $zooms = this.$gallery.find('[data-js-product-gallery-zoom]');

                        $zooms.each(function () {
                            var $this = $(this);

                            _.zooms.push({
                                $zoom: $this,
                                $container: $this.find('[data-js-product-gallery-zoom-container]'),
                                $ration: $this.find('[data-js-product-gallery-zoom-ratio]'),
                                $image: $this.find('[data-js-product-gallery-zoom-image]')
                            });
                        });
                    };

                    this._updateZoomSize = function(slides_namespace, zoomIndex, imgIndex) {
                        if(this[slides_namespace][this.indexes[imgIndex]].$img) {
                            this.zoom_current_size = {
                                main_image_width: this[slides_namespace][this.indexes[imgIndex]].$img.innerWidth(),
                                main_image_height: this[slides_namespace][this.indexes[imgIndex]].$img.innerHeight()
                            };

                            if(this[slides_namespace][this.indexes[imgIndex]].blockratio_width) {
                                this.zooms[zoomIndex].$container.attr('style', 'width: ' + this[slides_namespace][this.indexes[imgIndex]].blockratio_width + '% !important;' + (this[slides_namespace][this.indexes[imgIndex]].blockratio_width > 100 ? ' margin-left: -' + (this[slides_namespace][this.indexes[imgIndex]].blockratio_width - 100) / 2 + '% !important;' : ''));
                            }

                            this.zooms[zoomIndex].$ration.css({
                                'padding-top': 100 / +this[slides_namespace][this.indexes[imgIndex]].$img.attr('data-aspect-ratio') + '%'
                            });

                            this.zooms[zoomIndex].$image.css({
                                'padding-top': 100 / +this[slides_namespace][this.indexes[imgIndex]].$img.attr('data-aspect-ratio') + '%'
                            });
                        }
                    };

                    this._switchZoom = function (slides_namespace, zoomIndex, imgIndex, enable) {
                        if(enable) {
                            if(this[slides_namespace][this.indexes[imgIndex]].$img && this.zoom_current_image_index !== imgIndex) {
                                var enableZoom = function () {
                                    var $img = _[slides_namespace][_.indexes[imgIndex]].$img.clone();

                                    if($img[0].hasAttribute('srcset')) {
                                        $img.addClass('donothide');
                                    }

                                    _._updateZoomSize(slides_namespace, zoomIndex, imgIndex);

                                    _.zooms[zoomIndex].$image.append($img.removeAttr('data-ll-status').removeClass('loaded entered'));
                                    
                                    theme.ImagesLazyLoad.update($img);
                                    _.zooms[zoomIndex].$zoom.removeClass('invisible');
                                    _.zoom_current_index = zoomIndex;
                                    _.zoom_current_image_index = imgIndex;
                                };

                                if(this[slides_namespace][this.indexes[imgIndex]].lazyloaded || !this[slides_namespace][this.indexes[imgIndex]].lazyload_hold) {
                                    enableZoom();
                                } else {
                                    this[slides_namespace][this.indexes[imgIndex]].event_zoom_load = true;
                                    this[slides_namespace][this.indexes[imgIndex]].$img.one('load.zoom', function () {
                                        enableZoom();

                                        _[slides_namespace][_.indexes[imgIndex]].event_zoom_load = null;
                                    });
                                }
                            }
                        } else {
                            if(!zoomIndex && this.zoom_current_index) {
                                zoomIndex = this.zoom_current_index;
                                imgIndex = this.zoom_current_image_index;
                            }

                            if(this[slides_namespace][this.indexes[imgIndex]] && this[slides_namespace][this.indexes[imgIndex]].$img) {
                                if(this[slides_namespace][this.indexes[imgIndex]].event_zoom_load) {
                                    this[slides_namespace][this.indexes[imgIndex]].$img.unbind('load.zoom');
                                    this[slides_namespace][this.indexes[imgIndex]].event_zoom_load = null;
                                }

                                this.zooms[zoomIndex].$zoom.addClass('invisible');
                                this.zooms[zoomIndex].$image.html('');
                                this.zooms[zoomIndex].$container.add(this.zooms[zoomIndex].$image).removeAttr('style');
                            }

                            this.zoom_current_size = null;
                            this.zoom_current_index = null;
                            this.zoom_current_image_index = null;
                        }
                    };

                    this._updateZoomPosition = function (slides_namespace, zoomIndex, $img) {
                        if(!this.cursor) {
                            return;
                        }

                        var img_pos = $img[0].getBoundingClientRect(),
                            range_height = this.zoom_current_size.main_image_height * this.options.zoom_offset_coef,
                            range_width = this.zoom_current_size.main_image_width * this.options.zoom_offset_coef,
                            offset_height = (this.zoom_current_size.main_image_height - range_height) / 2,
                            offset_width = (this.zoom_current_size.main_image_width - range_width) / 2,
                            cursor_top = this.cursor.clientY - img_pos.top,
                            cursor_left = this.cursor.clientX - img_pos.left,
                            zoom_top = 0,
                            zoom_left = 0;
                        
                        if(cursor_top >= this.zoom_current_size.main_image_height - offset_height) {
                            zoom_top = Math.floor((this.zoom_current_size.main_image_height - offset_height * 2) * (this.zoom_current_size.main_image_height * this.options.zoom_scale_coef - this.zoom_current_size.main_image_height) / range_height);
                        } else if(cursor_top > offset_height) {
                            zoom_top = Math.floor((cursor_top - offset_height) * (this.zoom_current_size.main_image_height * this.options.zoom_scale_coef - this.zoom_current_size.main_image_height) / range_height);
                        }

                        if(cursor_left >= this.zoom_current_size.main_image_width - offset_width) {
                            zoom_left = Math.floor((this.zoom_current_size.main_image_width - offset_width * 2) * (this.zoom_current_size.main_image_width * this.options.zoom_scale_coef - this.zoom_current_size.main_image_width) / range_width);
                        } else if(cursor_left > offset_width) {
                            zoom_left = Math.floor((cursor_left - offset_width) * (this.zoom_current_size.main_image_width * this.options.zoom_scale_coef - this.zoom_current_size.main_image_width) / range_width);
                        }

                        this.zooms[zoomIndex].$image.css({
                            top: zoom_top * -1 + 'px',
                            left: zoom_left * -1 + 'px'
                        });
                    };

                    this._addZoomImgEvents = function ($container, slides_namespace, zoomIndex, imgIndex) {
                        $container.on({
                            'mouseenter': function () {
                                _._switchZoom(slides_namespace, zoomIndex, (typeof imgIndex === 'function' ? imgIndex() : imgIndex), true);
                            },
                            'mouseleave': function () {
                                _.zooms[zoomIndex].$image.addClass('invisible');
                                $container.removeClass('is-zooming');
                            },
                            'mousemove': function () {
                                if(_.zoom_current_size) {
                                    _._updateZoomPosition(slides_namespace, zoomIndex, $(this));

                                    $container.addClass('is-zooming');
                                    _.zooms[zoomIndex].$image.removeClass('invisible');
                                }
                            }
                        }, 'img');
                    };

                    this._addSingleZoomImgEvents = function ($container, slides_namespace, imgIndex) {
                        this._addZoomImgEvents($container, slides_namespace, 0, imgIndex);

                        this.$scroll_elem.on('scroll.productgallery.' + this.options.id, function () {
                            if(_[slides_namespace][_.indexes[(typeof imgIndex === 'function' ? imgIndex() : imgIndex)]].$img && $container.hasClass('is-zooming')) {
                                _._updateZoomPosition(slides_namespace, 0, _[slides_namespace][_.indexes[(typeof imgIndex === 'function' ? imgIndex() : imgIndex)]].$img);
                            }
                        });


                    };

                    this._addMultipleZoomImgEvents = function (slides_namespace, slides_all_namespace) {
                        var zoomIndex = 0;

                        $.each(this[slides_namespace], function (i) {
                            if(this.$img) {
                                _._addZoomImgEvents(this.$item, slides_namespace, zoomIndex++, function () {
                                    return _.indexes.indexOf(i);
                                });
                            }
                        });

                        this.$scroll_elem.on('scroll.productgallery.' + this.options.id, function () {
                            var zoomIndex = 0;

                            $.each(_[slides_all_namespace], function () {
                                if(this.$img) {
                                    if(this.$item.hasClass('is-zooming')) {
                                        _._updateZoomPosition(slides_namespace, zoomIndex, this.$img);

                                        return false;
                                    }

                                    zoomIndex++;
                                }
                            });
                        });
                    };

                    this._getZoomObj();

                    delete this._initZoom;
                };

                this._resizeInit(function() {
                    _._initZoom.call(_);
                }, 'desktop');
            }

            if(this.options.main.enabled || this.options.fullscreen.enable) {
                this._loadSlideImage = function (slides_namespace, index) {
                    if(this[slides_namespace][this.indexes[index]].lazyload_hold) {
                        this[slides_namespace][this.indexes[index]].lazyload_hold = null;

                        if(!this[slides_namespace][this.indexes[index]].$img.hasClass('loaded')) {
                            this[slides_namespace][this.indexes[index]].$img.removeClass('lazyload--hold').one('load', function () {
                                _[slides_namespace][_.indexes[index]].lazyloaded = true;
                            });
                        } else {
                            this[slides_namespace][this.indexes[index]].lazyloaded = true;
                        }

                        theme.ImagesLazyLoad.update(this[slides_namespace][this.indexes[index]].$img);
                    }
                };

                this._loadSlideContent = function (slides_namespace, index) {
                    this._loadSlideImage(slides_namespace, index);

                    if(this._loadMedia) {
                        this._loadMedia(slides_namespace, index);
                    }
                };

                this._timeoutCheckSliderContent = function (timeout) {
                    this.check_slider_content_timeout = setTimeout(function () {
                        _._checkSliderContent('main_slides');
                    }, timeout);
                };

                this._clearTimeoutCheckSliderContent = function () {
                    if(this.check_slider_content_timeout) {
                        clearTimeout(this.check_slider_content_timeout);

                        this.check_slider_content_timeout = null;
                    }
                };

                this._checkSliderContent = function (slides_namespace, preload_off) {
                    this._clearTimeoutCheckSliderContent();

                    var was_video = false,
                        active_index;

                    $.each(this.indexes, function (i) {
                        if(_[slides_namespace][_.indexes[i]].$item.hasClass('slick-active')) {
                            _._loadSlideContent(slides_namespace, i);

                            if(_[slides_namespace][_.indexes[i]].$video || _[slides_namespace][_.indexes[i]].$iframe) {
                                if(_.options.gallery_has_video) {
                                    _.switchMedia(slides_namespace, i, (was_video ? 'pause' : 'play'));
                                }

                                was_video = true;
                            }

                            if(!preload_off && !active_index && i > 0) {
                                _._loadSlideContent(slides_namespace, i - 1);
                            }

                            active_index = i;
                        } else {
                            if(_.options.gallery_has_video) {
                                _.switchMedia(slides_namespace, i, 'pause');
                            }

                            if(active_index !== undefined && i === active_index + 1) {
                                _._loadSlideContent(slides_namespace, i);
                            }

                            if(!preload_off && active_index !== undefined && i === active_index + 2) {
                                _._loadSlideContent(slides_namespace, i);
                            }
                        }
                    });
                };

                var sliderOnChangeEvents = function (slider_namespace, slides_namespace, slick_namespace) {
                    _[slider_namespace].on({
                        'afterChange': function (event, slick) {
                            _[slick_namespace] = slick;

                            _._checkSliderContent(slides_namespace);
                        }
                    });
                };
            }

            if(this.options.main.enabled) {
                this._initMainSlider = function () {
                    this.$main_slider_wrapper = this.$main_slider.parent('[data-js-product-gallery-main-slider-wrapper]');

                    this.$main_slider.removeClass('d-none-important');

                    if(this.options.main.slick.arrows) {
                        this.options.main.slick.prevArrow = this.$main_slider_wrapper.find('[data-js-product-gallery-main-arrow-prev]');
                        this.options.main.slick.nextArrow = this.$main_slider_wrapper.find('[data-js-product-gallery-main-arrow-next]');
                    }

                    if(this.options.grouped) {
                        this._groupMainSlider = function (group) {
                            if(this.current_group_main_slider !== group) {
                                if(this.options.gallery_has_video) {
                                    this.switchMedia('main_slides', this.main_slick.currentSlide, 'pause');
                                }

                                if(this._switchZoom) {
                                    this._switchZoom('main_slides', 0, this.main_slick.currentSlide);
                                }

                                this.$main_slider.slick('slickUnfilter');

                                if(this.options.group_values.indexOf(group) !== -1) {
                                    this.$main_slider.slick('slickFilter', '[data-group="' + group + '"], [data-group="video_group"]');
                                }

                                this.$main_slider.slick('setPosition');

                                this.main_slick = this.$main_slider.slick('getSlick');

                                this._updateData('main_slides', 'main_slick', 0, group);

                                _._mainGoToSlide(0);

                                this._checkSliderContent('main_slides');

                                this.current_group_main_slider = group;
                            }
                        };
                    }

                    this.$main_slider.one('init', function (event, slick) {
                        _.$main_slider_wrapper.addClass('initialized');

                        theme.Loader.unset(_.$main_slider_wrapper);

                        _.main_slick = slick;

                        _._updateData('main_slides', 'main_slick', _.options.main.slick.initialSlide);

                        if(!_.options.first_load_group) {
                            _._checkSliderContent('main_slides', true);

                            /*_._checkSliderContent('main_slides');
                            if(!window.tst && !window.is_design_mode) {
                                _._timeoutCheckSliderContent(1500);
                            }*/
                        }

                        _._mainGoToSlide = function(index) {
                            this.$main_slider.slick('slickGoTo', index, true);
                        };

                        $window.on('theme.changed.breakpoint.productgallery.' + _.options.id, function () {
                            _.$main_slider.slick('setPosition');
                        });

                        sliderOnChangeEvents('$main_slider', 'main_slides', 'main_slick');
                    });

                    if(this.options.gallery_has_video) {
                        this.$control_gallery.on('click', function () {
                            _.goToSlide(_.first_video_index);
                        });
                    }

                    this.$main_slider.slick(this.options.main.slick);

                    if(this.options.enable_zoom) {
                        this._initMainZoom = function () {
                            this.$main_slider.on({
                                'beforeChange': function (event, slick, currentSlide) {
                                    _._switchZoom('main_slides', 0, currentSlide);
                                },
                                'afterChange': function (event, slick, currentSlide) {
                                    _._switchZoom('main_slides', 0, currentSlide, true);
                                }
                            });

                            if(this.options.main.slick.slidesToShow === 1) {
                                this._addSingleZoomImgEvents(this.$main_slider, 'main_slides', function () {
                                    return _.main_slick.currentSlide;
                                });
                            } else {
                                this._addMultipleZoomImgEvents('main_slides', 'main_slides');
                            }

                            delete this._initMainZoom;
                        };

                        this._resizeInit(function() {
                            !_.$main_slider.hasClass('slick-initialized') ? _.$main_slider.on('init', _._initMainZoom.apply(_)) : _._initMainZoom.call(_);
                        }, 'desktop');
                    }

                    delete this._initMainSlider;
                };

                this._resizeInit(function () {
                    _._initMainSlider.call(_);

                    if(_.options.first_load_group) {
                        _._groupMainSlider(_.options.first_load_group);
                    }
                }, this.options.main.device);
            }

            if(this.options.thumbnail.enabled) {
                this.$thumbnail_slider = this.$gallery.find('[data-js-product-gallery-thumbnail-slider]');

                this._initThumbnailSlider = function () {
                    this.$thumbnail_items = this.$thumbnail_slider.find('[data-js-product-gallery-thumbnail-item]');

                    if(this.options.grouped) {
                        this._groupThumbnailSlider = function (group) {
                            if(this.current_group_thumbnail !== group) {
                                this.$thumbnail_slider.slick('slickUnfilter');

                                if(this.options.group_values.indexOf(group) !== -1) {
                                    this.$thumbnail_slider.slick('slickFilter', '[data-group="' + group + '"], [data-group="video_group"]');
                                }

                                this.$thumbnail_slider.slick('setPosition');
                                this.$thumbnail_items = this.$thumbnail_slider.find('[data-js-product-gallery-thumbnail-item]');
                                this._thumbnailGoToSlide(0);

                                theme.ImagesLazyLoad.update();

                                this.current_group_thumbnail = group;
                            }
                        };
                    }

                    this.$thumbnail_slider.removeClass('d-none-important');

                    this.options.thumbnail.slick.prevArrow = this.$gallery.find('[data-js-product-gallery-thumbnail-arrow-prev]');
                    this.options.thumbnail.slick.nextArrow = this.$gallery.find('[data-js-product-gallery-thumbnail-arrow-next]');

                    this.$thumbnail_slider.one('init', function () {
                        _.$thumbnail_items.removeClass('current').eq(_.main_slick.currentSlide).addClass('current');

                        $window.on('theme.changed.breakpoint.productgallery.' + _.options.id, function () {
                            _.$thumbnail_slider.slick('setPosition');
                        });

                        _._thumbnailGoToSlide = function(index) {
                            _.$thumbnail_slider.slick('slickGoTo', index);

                            _.$thumbnail_items.removeClass('current').eq(index).addClass('current');
                        };

                        _.$main_slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                            _._thumbnailGoToSlide(nextSlide);
                        });

                        _.$thumbnail_items.on('click', function () {
                            var $this = $(this);

                            if(!$this.hasClass('current')) {
                                _.goToSlide(_.$thumbnail_items.index($this));
                            }
                        });
                    });

                    if(this.main_slick.currentSlide) {
                        this.options.thumbnail.slick.initialSlide = this.main_slick.currentSlide;
                    }

                    this.$thumbnail_slider.slick(this.options.thumbnail.slick);

                    delete this._initThumbnailSlider;
                };

                this._resizeInit(function () {
                    _._initThumbnailSlider.call(_);

                    if(_.current_group_main_slider) {
                        _._groupThumbnailSlider(_.current_group_main_slider);
                    }
                }, this.options.thumbnail.device);
            }

            if(this.options.collage.enabled) {
                this.$collage = this.$gallery.find('[data-js-product-gallery-collage]');

                this._initCollage = function () {
                    this.$collage_items = this.$collage.find('[data-js-product-gallery-thumbnail-item]');

                    if(this.options.grouped) {
                        this._groupCollage = function (group) {
                            var $collage_items;

                            if(this.current_group_collage !== group) {
                                $collage_items = this.$collage.find('[data-js-product-gallery-thumbnail-item]');

                                $collage_items.removeClass('d-none');

                                if(this.options.group_values.indexOf(group) !== -1) {
                                    $collage_items.not('[data-group="' + group + '"], [data-group="video_group"]').addClass('d-none');
                                }

                                this.$collage_items = this.$collage.find('[data-js-product-gallery-thumbnail-item]').not('.d-none');

                                this._collageGoToSlide(0);

                                this.current_group_collage = group;
                            }
                        };
                    }

                    this.$collage_items.removeClass('current').eq(this.indexes[this.main_slick.currentSlide]).addClass('current');

                    this._collageGoToSlide = function(index) {
                        this.$collage_items.removeClass('current').eq(index).addClass('current');
                    };

                    this.$main_slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                        _._collageGoToSlide(nextSlide);
                    });

                    this.$collage_items.on('click', function () {
                        var $this = $(this);

                        if(!$this.hasClass('current')) {
                            _.goToSlide(_.$collage_items.index($this));
                        }
                    });

                    delete this._initCollage;
                };

                this._resizeInit(function () {
                    _._initCollage.call(_);
                }, this.options.collage.device);
            }

            if(this.options.sheet.enabled) {
                this._initSheet = function () {
                    this.$sheet = this.$gallery.find('[data-js-product-gallery-sheet]');
                    this.$sheet_items = this.$sheet.find('[data-js-product-gallery-sheet-item]');

                    this.sheet_slides = [];
                    this.sheet_contents = {
                        currentSlide: 0,
                        $slides: []
                    };

                    this._updateSheetContentData = function (get_all) {
                        this.sheet_contents.$slides = get_all ? this.$sheet_items : this.$sheet_items.not('.d-none');
                    };

                    this._updateSheetContentData(true);
                    this._updateData('sheet_slides', 'sheet_contents', 0);

                    this.sheet_slides_all = this.sheet_slides;

                    if(this.options.grouped) {
                        this._groupSheet = function (group) {
                            if(this.current_group_sheet !== group) {
                                if(this._switchZoom) {
                                    this._switchZoom('sheet_slides');
                                }

                                this.$sheet_items.removeClass('d-none');

                                if(this.options.group_values.indexOf(group) !== -1) {
                                    this.$sheet_items.not('[data-group="' + group + '"], [data-group="video_group"]').addClass('d-none');
                                }

                                this._updateSheetContentData();

                                this._updateData('sheet_slides', 'sheet_contents', 0, group);

                                this.current_group_sheet = group;
                            }
                        };
                    } else {
                        if(this.options.gallery_has_video && this.options.video_autoplay) {
                            this.switchMedia('sheet_slides', this.first_video_index, 'play');
                        }
                    }

                    if(this.options.gallery_has_video) {
                        this.$control_gallery.on('click', function () {
                            if(_.$scroll_elem[0] === window) {
                                $('html, body').velocity( 'scroll' , {
                                    offset: _.sheet_slides[_.indexes[_.first_video_index]].$video.offset().top,
                                    duration: 500,
                                    complete: function () {
                                        if(_.options.gallery_has_video) {
                                            _.switchMedia('sheet_slides', _.first_video_index, 'play');
                                        }
                                    }
                                });
                            } else {
                                _.$scroll_elem.animate({
                                    //scrollTop: (_.$scroll_elem[0].getBoundingClientRect().top - _.sheet_slides[_.indexes[_.first_video_index]].$video[0].getBoundingClientRect().top) * -1
                                    scrollTop: 0
                                }, {
                                    duration: 500,
                                    complete: function () {
                                        /*if(_.options.gallery_has_video) {
                                            _.switchMedia('sheet_slides', _.first_video_index, 'play');
                                        }*/
                                    }
                                });
                            }
                        });

                        $window.on('product-gallery-fullscreen.open.' + this.options.id, function () {
                            $.each(_.indexes, function (i) {
                                if(_.options.gallery_has_video) {
                                    _.switchMedia('sheet_slides', i, 'pause');
                                }
                            });
                        });
                    }

                    if(this.options.enable_zoom) {
                        this._initSheetZoom = function () {
                            this._addMultipleZoomImgEvents('sheet_slides', 'sheet_slides_all');

                            delete this._initSheetZoom;
                        };

                        this._resizeInit(function() {
                            _._initSheetZoom.call(_);
                        }, 'desktop');
                    }

                    delete this._initSheet;
                };

                this._resizeInit(function () {
                    _._initSheet.call(_);

                    if(_.options.first_load_group) {
                        _._updateSheetContentData();
                        _._updateData('sheet_slides', 'sheet_contents', 0, _.options.first_load_group);
                    }
                }, this.options.collage.device);
            }

            if(this.options.single) {
                this._initSingle = function () {
                    this.$single = this.$gallery.find('[data-js-product-gallery-main-single]');

                    this.single_content = {
                        currentSlide: 0,
                        $slides: this.$single.find('[data-js-product-gallery-main-item]')
                    };

                    this._updateData('single_slides', 'single_content', 0);

                    if(this.options.enable_zoom) {
                        this._initSingleZoom = function () {
                            this._addSingleZoomImgEvents(this.$single, 'single_slides', 0);

                            delete this._initSingleZoom;
                        };

                        this._resizeInit(function() {
                            _._initSingleZoom.call(_);
                        }, 'desktop');
                    }

                    delete this._initSingle;
                };

                this._resizeInit(function () {
                    _._initSingle.call(_);
                }, 'desktop');
            }

            if(this.options.fullscreen.enable) {
                this._initFullscreen = function () {
                    this.$control_fullscreen = this.$gallery.find('[data-js-product-gallery-control-fullscreen]');
                    this.$fullscreen = this.$gallery.find('[data-js-product-gallery-fullscreen]');
                    this.$fullscreen_slider = this.$gallery.find('[data-js-product-gallery-fullscreen-slider]');

                    if(this.options.fullscreen.slick.arrows) {
                        this.options.fullscreen.slick.prevArrow = this.$fullscreen.find('[data-js-product-gallery-fullscreen-arrow-prev]');
                        this.options.fullscreen.slick.nextArrow = this.$fullscreen.find('[data-js-product-gallery-fullscreen-arrow-next]');
                    }

                    this._toggleFullscreen = function (slides_namespace, contents_namespace, action) {
                        action = action ? action : this.$fullscreen.hasClass('show') ? 'hide' : 'show';

                        if(action === 'show') {
                            $body.addClass('product-gallery-fullscreen');

                            this.$fullscreen.addClass('show').one('transitionend', function () {
                                _.$fullscreen.removeClass('animate');
                            }).addClass('animate');

                            setTimeout(function () {
                                _.$fullscreen.addClass('visible');

                                if(_.$fullscreen.css('transition-duration') === '0s') {
                                    _.$fullscreen.trigger('transitionend');
                                }
                            }, 0);

                            $.each(this.indexes, function (i) {
                                var $rimg,
                                    $img,
                                    $content;

                                if(_[slides_namespace][_.indexes[i]].$img) {
                                    $rimg = _[slides_namespace][_.indexes[i]].$img.parent().clone();
                                    $img = $rimg.find('img');

                                    $img.removeAttr('data-ll-status').removeClass('lazyload--hold loaded').addClass('rimage__img--contain');

                                    if($img[0].hasAttribute('srcset')) {
                                        $img.addClass('donothide');
                                    }

                                    $content = $rimg;
                                } else if(_[slides_namespace][_.indexes[i]].$video) {
                                    $content = _[slides_namespace][_.indexes[i]].$video.parent().clone();
                                    $content.find('video').removeClass('playing');
                                } else if(_[slides_namespace][_.indexes[i]].$iframe) {
                                    $content = _[slides_namespace][_.indexes[i]].$iframe.parent().clone();
                                    $content.find('iframe').removeClass('playing');
                                } else if(_[slides_namespace][_.indexes[i]].$template) {
                                    $content = _[slides_namespace][_.indexes[i]].$template.clone();
                                } else if(_[slides_namespace][_.indexes[i]].$item.find('.model-viewer-wrapper').length) {
                                    $content = _[slides_namespace][_.indexes[i]].$item.find('.model-viewer-wrapper').clone();
                                }

                                _.$fullscreen_slider.append($('<div>').addClass('product-gallery__fullscreen_item').append($content));
                            });

                            this.$fullscreen_slider.one('init', function (event, slick) {
                                _.fullscreen_slick = slick;
                                _.fullscreen_slides = [];

                                _._updateData('fullscreen_slides', 'fullscreen_slick', _[slides_namespace].currentSlide);

                                theme.ImagesLazyLoad.update();

                                sliderOnChangeEvents('$fullscreen_slider', 'fullscreen_slides', 'fullscreen_slick');

                                if(_.options.gallery_has_video) {
                                    _.switchMedia(slides_namespace, _[contents_namespace].currentSlide, 'pause');
                                    _.switchMedia('fullscreen_slides', _[contents_namespace].currentSlide, 'play');
                                }
                            });

                            this.options.fullscreen.slick.initialSlide = _[contents_namespace].currentSlide;

                            this.$fullscreen_slider.slick(_.options.fullscreen.slick);

                            $body.on('keyup.productgallery.fullscreen.' + _.options.id, function(e) {
                                if(e.keyCode === 27) {
                                    _._toggleFullscreen(null, null, 'hide');
                                } else if(e.keyCode === 37 || e.keyCode === 40) {
                                    _.$fullscreen_slider.slick('slickGoTo', _.fullscreen_slick.currentSlide - 1);
                                } else if(e.keyCode === 38 || e.keyCode === 39) {
                                    _.$fullscreen_slider.slick('slickGoTo', _.fullscreen_slick.currentSlide + 1);
                                }
                            });

                        } else {
                            this.$fullscreen.unbind('transitionend').one('transitionend', function () {
                                _.$fullscreen.removeClass('show animate');

                                $body.removeClass('product-gallery-fullscreen');

                                _.$fullscreen_slider.slick('unslick').off().html('');
                            }).addClass('animate');

                            setTimeout(function () {
                                if(!_.$fullscreen.hasClass('visible') || _.$fullscreen.css('transition-duration') === '0s') {
                                    _.$fullscreen.trigger('transitionend');
                                }

                                _.$fullscreen.removeClass('visible');
                            }, 0);

                            $window.unbind('theme.resize.productgallery.fullscreen.' + _.options.id);
                            $body.unbind('keyup.productgallery.fullscreen.' + _.options.id);

                            this.fullscreen_slick = null;
                            this.fullscreen_slides = null;
                        }
                    };

                    this.$control_fullscreen.on('click', function () {
                        var slider_namespace = _.options.sheet.enabled ? 'sheet_slides' : _.options.single ? 'single_slides' : 'main_slides',
                            contents_namespace = _.options.sheet.enabled ? 'sheet_contents' : _.options.single ? 'single_content' : 'main_slick';

                        Loader.loadManually([
                                {type: 'styles', name: 'plugin_slick'},
                                {type: 'scripts', name: 'plugin_slick'}
                            ],
                            function() {
                                _._toggleFullscreen(slider_namespace, contents_namespace);
                            });

                        $window.trigger('product-gallery-fullscreen.open.' + _.options.id);
                    });

                    delete this._initFullscreen;
                };

                this._resizeInit(function() {
                    !_.$main_slider.hasClass('slick-initialized') ? _.$main_slider.on('init', _._initFullscreen.apply(_)) : _._initFullscreen.call(_);
                }, 'desktop');
            }

            this.$gallery.addClass('initialized');

            delete this._create;
        },
        _updateData: function (slides_namespace, contents_namespace, initialSlide, group) {
            var _ = this,
                i = 0;

            if(group) {
                if(this.options.group_values.indexOf(group) !== -1) {
                    this.indexes = [];

                    $.each(this.options.group_values, function (i, v) {
                        if(v === group || v === 'video_group') {
                            _.indexes.push(i);
                        }
                    });
                } else {
                    this.indexes = this.indexes_cache;
                }
            }

            if(this[contents_namespace]) {
                this[slides_namespace] = [];
                this.first_video_index = null;

                for(; i < this.indexes.length; i++) {
                    var $item = $(this[contents_namespace].$slides[i]),
                        obj = {},
                        $content = $item.find('img, video, iframe, template').first(),
                        $content_model = $item.find('.model-viewer-wrapper');

                    obj.$item = $item;

                    if($content.length) {
                        obj['$' + $content[0].tagName.toLowerCase()] = $content;
                    } else if($content_model.length) {
                        obj['$model'] = $content_model;
                    }

                    if($content_model.length || $content[0].tagName === 'TEMPLATE') {
                        if(slides_namespace === 'main_slides' && _.options.main.stretch_size !== 'auto') {
                            obj.$blockratio = $item.find('[data-js-product-gallery-blockratio]');
                        }
                    } else if($content[0].tagName === 'IMG') {
                        if(slides_namespace === 'main_slides') {
                            if(i === initialSlide && !group) {
                                obj.lazyloaded = true;
                            } else {
                                obj.lazyload_hold = true;
                            }

                            if(_.options.main.stretch_size !== 'auto') {
                                obj.$blockratio = $item.find('[data-js-product-gallery-blockratio]');

                                obj.blockratio_width = obj.$blockratio.attr('data-width');
                            }
                        }
                    } else if(($content[0].tagName === 'VIDEO' || $content[0].tagName === 'IFRAME') && _.first_video_index === null) {
                        _.first_video_index = i;
                    }

                    this[slides_namespace][_.indexes[i]] = obj;
                }
            }
        },
        _resizeInit: function (func, device) {
            var resize_event = 'theme.changed.breakpoint.productgallery.init.' + this.options.id + '.' + Math.random();

            if(device === 'all' || (device === 'desktop' && theme.current.is_desktop) || (device === 'mobile' && theme.current.is_mobile)) {
                func();
            } else if(device === 'desktop' || device === 'mobile') {
                $window.on(resize_event, function () {
                    if((device === 'desktop' && theme.current.is_desktop) || (device === 'mobile' && theme.current.is_mobile)) {
                        $window.unbind(resize_event);
                        func();
                    }
                });
            }
        },
        goToSlide: function(index) {
            if(this._mainGoToSlide) {
                this._mainGoToSlide(index);
            }

            if(this._thumbnailGoToSlide) {
                this._thumbnailGoToSlide(index);
            }

            if(this._collageGoToSlide) {
                this._collageGoToSlide(index);
            }
        },
        goToSlideById: function (id, group) {
            var index;

            if(this.options.grouped) {
                if(this._groupMainSlider) {
                    this._groupMainSlider(group);
                }

                if(this._groupThumbnailSlider) {
                    this._groupThumbnailSlider(group);
                }

                if(this._groupCollage) {
                    this._groupCollage(group);
                }

                if(this._groupSheet) {
                    this._groupSheet(group);
                }
            } else {
                index = this.options.media_id_index.indexOf(id);

                if(index === -1) {
                    index = 0;
                }

                this.goToSlide(index);
            }
        },
        destroy: function() {
            if(this.$main_slider && this.$main_slider.hasClass('slick-initialized')) {
                this._clearTimeoutCheckSliderContent();
                this.$main_slider.slick('unslick').off();
            }

            if(this.$thumbnail_items) {
                this.$thumbnail_slider.slick('unslick').off();
            }

            $window.unbind('theme.changed.breakpoint.productgallery' + this.options.id);
            $window.unbind('theme.resize.productgallery.' + this.options.id);
            $window.unbind('product-gallery-fullscreen.open.' + this.options.id);
            $window.unbind('scroll.productgallery.' + this.options.id);
            $window.unbind('mousemove.productgallery.' + this.options.id);

            $body.unbind('keyup.productgallery.fullscreen.' + this.options.id);

            this.$gallery.find('*').off();

            this.$gallery.removeClass('initialized');

            $.Widget.prototype.destroy.call(this);

            delete this;
        }
    });
})(jQueryTheme);