const Product = require('../models/product')
const Order = require('../models/order')
const dd = require('dump-die')

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      })
    })
    .catch(err => console.log(err))
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      })
    })
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/'
      })
    })
    .catch(err => console.log(err))
};

exports.getCart = (req, res, next) => {
  // console.log(req.user.cart);
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId
  let fetchedCart
  let newQuantity = 1
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart // outputnya data cart punya user (example cart id = 1)
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      let product

      //cek apakah data product pada cart ada atau tidak
      if (products.length > 0) {
        product = products[0] //jika ada, ambil record yang pertama
      }
      if (product) {
        //jika product ada, maka ambil quantity nya
        const oldQuantity = product.cartItem.quantity
        newQuantity = oldQuantity + 1
        return product
      }

      return Product.findByPk(prodId) //ambil data product dari database berdasarkan id
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      })
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch()
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      const product = products[0]
      return product.cartItem.destroy()
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => console.log(err))
};

exports.postOrder = (req, res, next) => {
  let fetchedCart
  // ambil cart usernya
  req.user.getCart()
    .then(cart => {
      // ambil data produk yang ada dalam cart user
      fetchedCart = cart
      return cart.getProducts()
    })
    .then(products => {
      //buat order baru di table order
      return req.user.createOrder()
        .then(order => {

          return order.addProducts(products.map(product => {
            // ambil data product dan quantity nya
            product.orderItem = { quantity: product.cartItem.quantity }
            // kembalikan data product
            return product
          }))

        })
        .catch(err => console.log(err))
    })
    .then(result => {
      // hapus data cart user
      return fetchedCart.setProducts(null)
    })
    .then(result => {
      // redirect ke halaman order
      res.redirect('/orders')
    })
    .catch(err => console.log(err))
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
