const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Orders = require('../models/Orders');
const Comments = require('../models/Comments');
const News = require('../models/News');

const userControllers = {
    //get all users admin
    getAllUsers: async (req, res) => {
        try {
            const user = await User.find().select('-password'); //Lấy tất cả trừ password
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json('Lấy thông tin tài khoản tất bại');
        }
    },

    //delete user admin
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            const listuser = await User.find().select('-password');
            res.status(200).json(listuser);
        } catch (error) {
            res.status(500).json('Xóa tài khoản thất bại');
        }
    },

    //update info listUser admin
    updateListUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body.body);
            const listuser = await User.find().select('-password');
            res.status(200).json(listuser);
        } catch (error) {
            res.status(500).json('Cập nhật thông tin thất bại');
        }
    },

    //get all products admin
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json('Lấy danh sách sản phẩm thất bại');
        }
    },

    //Create product admin
    createProduct: async (req, res) => {
        try {
            const newProduct = await new Product({
                name: req.body.name,
                product: {
                    number: req.body.product.number,
                    avatar: req.body.product.avatar,
                    description: req.body.product.description,
                    price: req.body.product.price,
                    cost: req.body.product.cost,
                    percent: req.body.product.percent,
                    brandOrigin: req.body.product.brandOrigin,
                    madeIn: req.body.product.madeIn,
                    producer: req.body.product.producer,
                    appropriateAge: req.body.product.appropriateAge,
                    userManual: req.body.product.userManual,
                    storageInstructions: req.body.product.storageInstructions,
                    weight: req.body.product.weight,
                },
            });
            await newProduct.save();
            const listProduct = await Product.find();
            res.status(200).json(listProduct);
        } catch (error) {
            res.status(500).json('Tạo sản phẩm mới thất bại');
        }
    },

    //delete product admin
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            const listProduct = await Product.find();
            res.status(200).json(listProduct);
        } catch (error) {
            res.status(500).json('Xóa sản phẩm thất bại');
        }
    },

    //update Product admin
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, req.body.body);
            const listProduct = await Product.find();
            res.status(200).json(listProduct);
        } catch (error) {
            res.status(500).json('Cập nhật thông tin sản phẩm thất bại');
        }
    },

    //add product to cart
    createCart: async (req, res) => {
        try {
            const newCart = await new Cart({
                userId: req.body.userId,
                productId: req.body.productId,
                description: req.body.description,
                avatar: req.body.avatar,
                price: req.body.price,
                count: req.body.count,
                productTotal: req.body.productTotal,
            });

            const cart = await newCart.save();
            const allCarts = await Cart.find();
            res.status(200).json(allCarts);
        } catch (error) {
            res.status(500).json('Thêm sản phẩm thất bại');
        }
    },

    //get all products to cart
    getAllCarts: async (req, res) => {
        try {
            const allCarts = await Cart.find();
            res.status(200).json(allCarts);
        } catch (error) {
            res.status(500).json('Lấy tất cả giỏ hàng thất bại');
        }
    },

    //delete product from cart
    deleteProductCarts: async (req, res) => {
        try {
            const product = await Cart.findByIdAndDelete(req.params.id);
            const newCarts = await Cart.find();

            res.status(200).json(newCarts);
        } catch (error) {
            res.status(500).json('Xóa thất bại');
        }
    },

    //create new order
    createNewOrder: async (req, res) => {
        try {
            //lấy id và số lượng của từng sản phẩm trong list đặt hàng ra
            let arrListProducts = [];
            req.body.listproduct.map((item) => {
                arrListProducts.push({
                    productId: item.productId,
                    count: item.count,
                });
            });

            //Cập nhật lại số lượng sản phẩm
            for (const product of arrListProducts) {
                let id = product.productId;
                let count = product.count;
                const result = await Product.updateOne({ _id: id }, { $inc: { 'product.number': -count } });
            }

            const newOrder = await new Orders({
                user: req.body.user,
                listproduct: req.body.listproduct,
                paymentMethods: req.body.paymentMethods,
                total: req.body.total,
                tradingCode: req.body.tradingCode,
                isPayment: req.body.isPayment,
                istransported: req.body.istransported,
                isSuccess: req.body.isSuccess,
                dateCreate: req.body.dateCreate,
                dateEnd: req.body.dateEnd,
            });

            await newOrder.save();
            const allOrders = await Orders.find();

            await res.status(200).json(allOrders);
        } catch (error) {
            res.status(500).json('Đặt hàng thất bại');
        }
    },

    //get all orders
    getAllOders: async (req, res) => {
        try {
            const allOrders = await Orders.find();
            res.status(200).json(allOrders);
        } catch (error) {
            res.status(500).json('Lấy tất cả đơn hàng thất bại');
        }
    },

    //update Order
    updateOrders: async (req, res) => {
        try {
            await Orders.findByIdAndUpdate(req.params.id, req.body.body);
            const listProduct = await Orders.find();
            res.status(200).json(listProduct);
        } catch (error) {
            res.status(500).json('Cập nhật thông tin thất bại');
        }
    },

    //delete order from cart
    deleteOrder: async (req, res) => {
        try {
            await Orders.findByIdAndDelete(req.params.id);
            const newOrders = await Orders.find();

            res.status(200).json(newOrders);
        } catch (error) {
            res.status(500).json('Xóa thất bại');
        }
    },

    //create comment
    createComment: async (req, res) => {
        try {
            const newComment = await new Comments({
                user: req.body.user,
                rating: req.body.rating,
                comment: req.body.comment,
                reComment: req.body.reComment,
                dateComment: req.body.dateComment,
                dateReComment: req.body.dateReComment,
                currentProduct: req.body.currentProduct,
            });

            await newComment.save();
            const allComments = await Comments.find();

            res.status(200).json(allComments);
        } catch (error) {
            res.status(500).json('Bình luận thất bại');
        }
    },

    //get All Comment
    getAllComment: async (req, res) => {
        try {
            const allComment = await Comments.find();
            res.status(200).json(allComment);
        } catch (error) {
            res.status(500).json('Lấy bình luận thất bại');
        }
    },

    updateComment: async (req, res) => {
        try {
            await Comments.findByIdAndUpdate(req.params.id, req.body.body);

            const listComments = await Comments.find();
            res.status(200).json(listComments);
        } catch (error) {
            res.status(500).json('Phản hồi bình luận thất bại');
        }
    },

    deleteComment: async (req, res) => {
        try {
            await Comments.findByIdAndDelete(req.params.id);

            const listComments = await Comments.find();
            res.status(200).json(listComments);
        } catch (error) {
            res.status(500).json('Xoá bình luận thất bại');
        }
    },

    //create news
    createNews: async (req, res) => {
        try {
            const newNews = await new News({
                author: req.body.author,
                category: req.body.category,
                title: req.body.title,
                titlePhoto: req.body.titlePhoto,
                eyes: req.body.eyes,
                subTitle: req.body.subTitle,
                content: req.body.content,
                dateCreate: req.body.dateCreate,
                dateUpdate: req.body.dateUpdate,
            });

            await newNews.save();
            const allNews = await News.find();

            res.status(200).json(allNews);
        } catch (error) {
            res.status(500).json('Tạo bài viết thất bại');
        }
    },

    //get All news
    getAllNews: async (req, res) => {
        try {
            const allNews = await News.find();
            res.status(200).json(allNews);
        } catch (error) {
            res.status(500).json('Lấy bài viết thất bại');
        }
    },

    //update News
    updateNew: async (req, res) => {
        try {
            await News.findByIdAndUpdate(req.params.id, req.body.body);

            const listNews = await News.find();
            res.status(200).json(listNews);
        } catch (error) {
            res.status(500).json('Cập nhật bài viết thất bại');
        }
    },

    //delete new
    deleteNew: async (req, res) => {
        try {
            await News.findByIdAndDelete(req.params.id);

            const listNews = await News.find();
            res.status(200).json(listNews);
        } catch (error) {
            res.status(500).json('Xóa bài viết thất bại');
        }
    },
};

module.exports = userControllers;
