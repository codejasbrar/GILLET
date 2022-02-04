(function($){

  'use strict';

  theme.ProductPage = (function() {

    function ProductPage(container) {
      this.$container = $(container);
  
      //var sectionId = this.$container.attr('data-section-id');
  
      //this.settings = {};
  
      this.namespace = '.product-page';
  
      this.onLoad();
    }
  
    ProductPage.prototype = $.extend({}, ProductPage.prototype, {
      onLoad: function () {
        var _ = this,
            $product = this.$container.find('[data-js-product]'),
            $gallery = $product.find('[data-js-product-gallery]'),
            $countdown = $product.find('[data-js-product-countdown] .js-countdown'),
            $text_countdown = $product.find('.js-text-countdown'),
            $visitors = $product.find('.js-visitors'),
            $template_dynamic_checkout = $product.find('.template-dynamic-checkout'),
            $dynamic_checkout;

        if($gallery.length && $.fn.productGallery) {
          this.$gallery = $gallery;
          this.$gallery.productGallery();
        }

        if($template_dynamic_checkout.length) {
          this.checkCheckoutLoad = function($dynamic_checkout) {
            if($dynamic_checkout[0].getBoundingClientRect().top < window.innerHeight + 300) {
              $window.unbind('scroll.checkCheckoutLoad');

              if (window.Shopify && Shopify.PaymentButton) {
                Shopify.PaymentButton.init();
              }
            }
          };

          this.dynamicCheckoutUpdate = function($btn, $dynamic_checkout) {
            var $button_wrapper = $dynamic_checkout.find('[data-js-dynamic-checkout-button-wrapper]');

            $button_wrapper[$btn.is(':checked') ? 'removeClass' : 'addClass']('disabled');
          };

          $template_dynamic_checkout.replaceWith($($template_dynamic_checkout[0].content).find('[data-js-product-button-dynamic-checkout]'));
          $template_dynamic_checkout.remove();

          $dynamic_checkout = $product.find('.js-dynamic-checkout');

          $dynamic_checkout.on('change', '[data-js-dynamic-checkout-confirmation]', function () {
            _.dynamicCheckoutUpdate($(this), $dynamic_checkout);
          });

          $dynamic_checkout.find('[data-js-dynamic-checkout-confirmation]').each(function () {
            _.dynamicCheckoutUpdate($(this), $dynamic_checkout);
          });

          this.checkCheckoutLoad($dynamic_checkout);

          $window.on('scroll.checkCheckoutLoad', function () {
            _.checkCheckoutLoad($dynamic_checkout);
          });
        }

        if(theme.is_loaded) {
          if($countdown.length) {
            theme.ProductCountdown.init($countdown);
          }
          
          if($text_countdown.length) {
            theme.ProductTextCountdown.init($text_countdown);
          }
  
          if($visitors.length) {
            theme.ProductVisitors.init($visitors);
          }
  
          theme.StoreLists.checkProductStatus($product);
  
          if(theme.Tabs) {
            theme.Tabs.init();
          }
        }
      },
      onUnload: function() {
        this.$container.off(this.namespace);
  
        if(this.$gallery) {
          this.$gallery.productGallery('destroy');
          this.$gallery = null;
        }

        $window.unbind('scroll.checkCheckoutLoad');
      }
    });
  
    return ProductPage;
  })();
  
  $(function() {
    theme.sections.register('product-page', theme.ProductPage);
  });
})(jQueryTheme);