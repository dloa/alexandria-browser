/*
 * SimpleWallet.js
 *
 * This is the <modified> core of the LiteVault, all of this Typescript
 * and/or related javascript is held under the AGPL Licence
 * unless otherwise noted on the Git repository
 *
 * Created by Someguy123 (http://someguy123.com)
 * Modified by bitspill
 */
var flovaultBaseURL = "https://flovault.alexandria.io";
var florinsightBaseURL = "https://florinsight.alexandria.io";

var Wallet = (function () {
    function Wallet(identifier, password) {
        this.addresses = {};
        this.balances = {};
        this.coin_network = Bitcoin.networks.florincoin;
        this.CryptoConfig = {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Iso10126,
            iterations: 5
        };
        this.identifier = identifier;
        this.password = password;
        this.known_spent = [];
        this.known_unspent = [];

        if('spentdata' in localStorage) {
            try {
                var spdata = JSON.parse(localStorage.spentdata);
                this.known_spent = spdata.spent;
                this.known_unspent = spdata.unspent;
            } catch(e) {
                // local data is corrupt?
                delete localStorage['spentdata'];
            }
        }
    };

    Wallet.prototype.putSpent = function (spent) {
        this.known_spent.push(spent);
        var unspent = this.known_unspent;
        // clean out known unspent
        for (var v in unspent) {
            if (JSON.stringify(spent) == JSON.stringify(unspent[v])) {
                delete this.known_unspent[k];
            }
        }
        this.storeSpent();
    };

    Wallet.prototype.putUnspent = function (spent) {
        this.known_unspent.push(spent);
        this.storeSpent();
    };

    Wallet.prototype.storeSpent = function() {
        var spdata = {spent: this.known_spent, unspent: this.known_unspent};
        localStorage.spentdata = JSON.stringify(spdata);
    }
    /**
     * setSharedKey()
     *
     * This is used when the wallet is first created, we get the shared key
     * from the server, we give it to this wallet object using this function
     * because we haven't yet written the encrypted wallet to the server
     * which contains the shared key.
     *
     * @param sKey
     */
    Wallet.prototype.setSharedKey = function (sKey) {
        this.shared_key = sKey;
    };

    Wallet.prototype.generateAddress = function () {
        var key = Bitcoin.ECKey.makeRandom();
        var PubKey = key.pub.getAddress(this.coin_network).toString();
        var PrivKey = key.toWIF(this.coin_network);
        this.addAddress(PubKey, {label: "", priv: PrivKey, addr: PubKey});
        this.refreshBalances();
        this.store();
    };
    Wallet.prototype.addAddress = function (address, data) {
        if (address in this.addresses) {
            alert("Warning: address " + address + " already exists, skipping.");
        }
        else {
            this.addresses[address] = data;
        }
    };

    Wallet.prototype.load = function (_success) {
        if (_success === void 0) {
            _success = function () {
            };
        }
        var _this = this;
        $.get(flovaultBaseURL + '/wallet/load/' + this.identifier, function (data) {
            if (data.error !== false) {
                alert(data.error.message);
            }
            else {
                var decWallet, decWalletString, decWalletJSON;
                //console.log("Decrypting data: '" + data.wallet + "' with password " + _this.password);
                console.log('Decrypting wallet');
                try {
                    // Decrypt wallet
                    decWallet = CryptoJS.AES.decrypt(data.wallet, _this.password, _this.CryptoConfig);
                    decWalletString = decWallet.toString(CryptoJS.enc.Utf8);
                    // Load the JSON, then use it to initialize the wallet
                    decWalletJSON = JSON.parse(decWalletString);
                    _this.setSharedKey(decWalletJSON.shared_key);
                    _this.addresses = decWalletJSON.addresses;
                    console.log('Wallet loaded successfully. Refreshing balances and running success callback.');
                    try {
                        _this.refreshBalances();
                        // run the success callback
                        _success();
                    }
                    catch (ex) {
                        alert("There was an error rendering this page. Please contact an administrator.");
                        console.log(ex);
                    }
                }
                catch (ex) {
                    alert("Error decrypting wallet - Invalid password?");
                    console.log(ex);
                }
            }
        }, "json").fail(function () {
            alert("Error loading wallet from server. Possible connection problems");
        });
    };
    Wallet.prototype.store = function () {
        var walletData = this.wallet_serialize();
        console.log("Encrypting data");
        var encWalletData = CryptoJS.AES.encrypt(walletData, this.password, this.CryptoConfig);
        var encWalletDataCipher = encWalletData.toString();
        var _this = this;
        $.post(flovaultBaseURL + "/wallet/update", {
            identifier: this.identifier,
            shared_key: this.shared_key,
            wallet_data: encWalletDataCipher
        }, function (data) {
            if (data.error !== false) {
                alert(data.error.message);
                alert('WARNING: There was an error saving your wallet. ' +
                    'If you have created new addresses in the past few minutes, ' +
                    'please save their private keys ASAP, as your encrypted wallet' +
                    ' may not have been updated properly on our servers.');
            }
        }, "json").fail(function () {
            alert('WARNING: There was an error saving your wallet. ' +
                'If you have created new addresses in the past few minutes, ' +
                'please save their private keys ASAP, as your encrypted wallet' +
                ' may not have been updated properly on our servers.');
        });
    };

    /**
     * refreshBalances(callback)
     *
     * Updates balances from server, then outputs the balance map
     * to the callback function.
     *
     * @param callback(balances)
     */
    Wallet.prototype.refreshBalances = function (callback) {
        if (callback === void 0) {
            callback = function (balances) {
            };
        }
        var _this = this;
        for (var i in this.addresses) {
            $.get(flovaultBaseURL + '/wallet/getbalances/' + this.addresses[i].addr, function (data) {
                if (data) {
                    var addr_data = data;
                    _this.setBalance(addr_data['addrStr'], addr_data['balance']);
                }
            }, "json");
        }
    };
    Wallet.prototype.getUnspent = function (address, callback) {
        $.get(florinsightBaseURL + '/api/addr/' + address + '/utxo', function (data) {
            console.log(data);
            // put into window var
            var output;
            // blockr's API is inconsistent and returns a bare object
            // if there's only one unspent. We fix that and return an array ALWAYS.
            if (Array.isArray(data)) {
                callback(data);
            }
            else {
                callback([data]);
            }
        }, "json");
    };

    /**
     * Attempts to remove inputs that are known to be spent.
     * This helps avoid problems when sending multiple transactions shortly
     * after eachother.
     */
    Wallet.prototype.removeSpent = function (coins) {
        console.log("removeSpent");
        console.log(JSON.stringify(coins));
        var clean_coins = coins;
        for (var v in this.known_spent) {
            for (var k in coins) {
                if (JSON.stringify(coins[k]) == JSON.stringify(this.known_spent[v])) {
                    delete clean_coins[k];
                }
            }
        }
        console.log(JSON.stringify(clean_coins));
        return clean_coins;
    };
    Wallet.prototype.mergeUnspent = function (unspent, address) {
        var merged = unspent;
        console.log("!unspent!");
        console.log(JSON.stringify(unspent, null, 2));

        for (var i = 0; i < this.known_unspent.length; ++i)
            if (this.known_unspent[i].address == address) {
                var dupe = false;
                for (var j = 0; j < unspent.length; ++j)
                    if (this.known_unspent[i].txid == merged[j].txid &&
                        this.known_unspent[i].vout == merged[j].vout) {
                        dupe = true;
                        break;
                    }
                if (!dupe)
                    merged.push(this.known_unspent[i]);
            }

        console.log("!known_unspent!");
        console.log(JSON.stringify(this.known_unspent, null, 2));
        console.log("!merged!");
        console.log(JSON.stringify(merged, null, 2));
        return merged;
    };
    /**
     * calculateBestUnspent()
     *
     * Sorts passed in unspents by confirmations descending.
     *
     * Returns an object containing the required unspents to match the
     * amount requested, as well as the total Litecoin value of them.
     *
     * @param amount (amount of coins to reach)
     * @param unspents (array of Unspent Transactions)
     * @returns {{unspent: Array<UnspentTX>, total: number}}
     */
    Wallet.prototype.calculateBestUnspent = function (amount, unspents) {
        console.log("calcBestUnspent");
        console.log(unspents);
        // note: unspents = [ {tx, amount, n, confirmations, script}, ... ]
        // TODO: implement a real algorithm to determine the best unspents
        // e.g. compare the size to the confirmations so that larger coins
        // are used, as well as ones with the highest confirmations.
        unspents.sort(function (a, b) {
            // if (a.confirmations > b.confirmations) {
            //     return -1;
            // }
            // if (a.confirmations < b.confirmations) {
            //     return 1;
            // }
            if (a.amount > b.amount) {
                return 1;
            }
            if (a.amount < b.amount) {
                return -1;
            }
            return 0;
        });
        var CutUnspent = [], CurrentAmount = 0;
        for (var v in unspents) {
            // if (parseFloat(unspents[v].amount) > amount) {
            //     CurrentAmount += parseFloat(unspents[v].amount);
            //     CutUnspent.push(unspents[v]);
            //     break;
            // }
            CurrentAmount += parseFloat(unspents[v].amount);
            CutUnspent.push(unspents[v]);
            if (CurrentAmount > amount) {
                break;
            }
        }
        if (CurrentAmount < amount) {
            throw "Not enough coins in unspents to reach target amount";
        }
        return {unspent: CutUnspent, total: CurrentAmount};
    };
    Wallet.prototype.validateKey = function (key, priv) {
        if (priv === void 0) {
            priv = false;
        }
        try {
            var version;
            // are we validating a private key?
            if (priv === true) {
                version = this.coin_network.wif;
            }
            else {
                version = this.coin_network.pubKeyHash;
            }
            var decoded = Bitcoin.base58check.decode(key);

            if( this.coin_network == Bitcoin.networks.florincoin && priv == true){
                // Backwards compatibility for private keys saved under litecoin settings.
                return decoded[0] == Bitcoin.networks.florincoin.wif || decoded[0] == Bitcoin.networks.litecoin.wif
            }

            // is this address for the right network?
            return (decoded[0] == version);
        }
        catch (ex) {
            // exceptions mean invalid address
            return false;
        }
    };
    Wallet.prototype.sortTransactions = function (transactions) {
        var allTransactions = [];
        for (var v in transactions) {
            if (transactions[v]) {
                var newTx = transactions[v];
                allTransactions.push(newTx);
            }
        }
        return allTransactions;
    };
    Wallet.prototype.sendCoins = function (fromAddress, toAddress, amount, txComment, callback) {
        if (typeof txComment == "undefined")
            txComment = '';
        if (typeof txComment == typeof Function) {
            callback = txComment;
            txComment = '';
        }
        if (typeof callback != typeof Function)
            callback = function (err, data) {
            };

        var _this = this;
        if (this.validateKey(toAddress) && this.validateKey(fromAddress)) {
            if (fromAddress in this.addresses && this.validateKey(this.addresses[fromAddress].priv, true)) {
                this.refreshBalances();
                if (this.balances[fromAddress] < amount) {
                    alert("You don't have enough coins to do that");
                    return;
                }
                this.getUnspent(fromAddress, function (data) {
                    var merged = _this.mergeUnspent(data, fromAddress);
                    var clean_unspent = _this.removeSpent(merged);
                    data = _this.calculateBestUnspent(amount, clean_unspent);
                    console.log(data);
                    // temporary constant
                    var minFeePerKb = 100000;
                    var tx = new Bitcoin.Transaction();
                    // IMPORTANT! We're dealing with Satoshis now
                    var totalUnspent = parseInt((data.total * Math.pow(10, 8)).toString());
                    amount = parseInt((amount * Math.pow(10, 8)).toString());
                    if (amount < minFeePerKb) {
                        alert("You must send at least 0.001 FLO (otherwise your transaction may get rejected)");
                        return;
                    }
                    console.log('Sending ' + amount + ' satoshis from ' + fromAddress + ' to ' + toAddress + ' unspent amt: ' + totalUnspent);
                    var unspents = data.unspent;
                    _this.putSpent.bind(_this);
                    for (var v in unspents) {
                        if (unspents[v].confirmations) {
                            tx.addInput(unspents[v].txid, unspents[v].vout);
                            _this.putSpent(unspents[v]);
                        }
                    }
                    tx.addOutput(toAddress, amount);
                    console.log(tx);
                    var estimatedFee = _this.coin_network.estimateFee(tx);
                    if (estimatedFee > 0) {
                        // Temporary fix for "stuck" transactions
                        // estimatedFee = estimatedFee * 3;
                    }
                    if ((amount + estimatedFee) > totalUnspent) {
                        alert("Can't fit fee of " + estimatedFee / Math.pow(10, 8) + " - lower your sending amount");
                        console.log('WARNING: Total is greater than total unspent: %s - Actual Fee: %s', totalUnspent, estimatedFee);
                        return;
                    }
                    var changeValue = parseInt((totalUnspent - amount - estimatedFee).toString());
                    // only give change if it's bigger than the minimum fee
                    if (changeValue >= minFeePerKb) {
                        tx.addOutput(fromAddress, changeValue);
                    }
                    tx.ins.forEach(function (input, index) {
                        tx.sign(index, new Bitcoin.ECKey.fromWIF(_this.addresses[fromAddress].priv));
                    });
                    console.log('Sending amount %s to address %s - Change value: %s - Fee in satoshis: %s - Fee in standard: %s', amount / Math.pow(10, 8), toAddress, changeValue / Math.pow(10, 8), estimatedFee, (estimatedFee / Math.pow(10, 8)));
                    var rawHex = tx.toHex();
                    console.log(rawHex);

                    console.log("Comment:");
                    console.log(txComment);

                    var lenBuffer = Bitcoin.bufferutils.varIntBuffer(txComment.length);
                    var hexComment = '';

                    for (var i = 0; i < lenBuffer.length; ++i) {
                        hexComment += toHex(lenBuffer[i]);
                    }
                    for (i = 0; i < txComment.length; ++i) {
                        hexComment += toHex(txComment.charCodeAt(i));
                    }
                    rawHex += hexComment;

                    console.log("Raw");
                    console.log(rawHex);

                    _this.pushTX(rawHex, function (data) {
                        _this.putUnspent.bind(_this);
                        // If I'm paying myself it's known_unspent
                        if (toAddress == fromAddress) {
                            _this.putUnspent({
                                address: toAddress,
                                txid: data.txid,
                                vout: 0,
                                confirmations: -1,
                                amount: amount / Math.pow(10, 8)
                            });
                        }
                        // Add the change as a known_unspent
                        if (changeValue >= minFeePerKb)
                            _this.putUnspent({
                                address: fromAddress,
                                txid: data.txid,
                                vout: 1,
                                confirmations: -1,
                                amount: changeValue / Math.pow(10, 8)
                            });
                        try {
                            beep(300, 4);
                        }
                        catch (e) {
                            console.error('Beep is not supported by this browser???');
                        }
                        if (typeof callback == typeof Function)
                            callback(null, data);
                    });
                });
                this.refreshBalances();
            }
            else {
                alert("Error: You don't own that address!");
            }
        }
        else {
            alert('Error: Your sending or recipient address is invalid. Please check for any typos');
        }
    };
    Wallet.prototype.pushTX = function (tx, callback) {
        if (callback === void 0) {
            callback = function (data) {
            };
        }
        var _this = this;
        $.post(flovaultBaseURL + '/wallet/pushtx', {hex: tx}, function (data) {
            if (!data.txid) {
                alert('There was an error pushing your transaction. May be a temporary problem, please try again later.');
            }
            else {
                callback(data);
            }
            _this.refreshBalances();
        }, "json").fail(function () {
            alert('There was an error pushing your transaction. May be a temporary problem, please try again later.');
        });
    };
    Wallet.prototype.setBalance = function (address, balance) {
        this.balances[address] = balance;
    };
    /**
     * getTotalBalance()
     *
     * This function returns the total balance calculated
     * from this.balances; NOTE: It does NOT update the balance
     * from the server, if you need that, do this.refreshBalances();
     * before executing this function to get an up to date result.
     *
     * ~~Someguy123
     */
    Wallet.prototype.getTotalBalance = function () {
        var total = 0;
        for (var v in this.balances) {
            total += parseFloat(this.balances[v].toString());
        }
        return total;
    };

    Wallet.prototype.signMessage = function (address, message) {
        var privkey = new Bitcoin.ECKey.fromWIF(this.addresses[address].priv);
        var signed_message = Bitcoin.Message.sign(privkey, message, this.coin_network);
        return signed_message.toString('base64');
    };

    /**
     * wallet_serialize()
     *
     * Returns the JSON version of the wallet, including
     * only the necessities, such as the shared key,
     * addresses, labels, and private keys
     *
     * @param prettify
     * @returns {string}
     */
    Wallet.prototype.wallet_serialize = function (prettify) {
        if (prettify === void 0) {
            prettify = false;
        }
        var walletdata = ({
            shared_key: this.shared_key,
            addresses: this.addresses
        });
        if (prettify) {
            return JSON.stringify(walletdata, null, "\t");
        }
        else {
            return JSON.stringify(walletdata);
        }
    };

    return Wallet;
})();

$('#login-btn').click(function () {
    var identifier = $('#identifier-txt').val(), password = $('#password-txt').val();
    $.cookie('identifier', identifier);
    wallet = new Wallet(identifier, password);
    $.get('/wallet/checkload/' + identifier, function (data) {
        if (data.error) {
            alert('error loading wallet: ' + data.error.message);
        }
        else {
            console.log(data);

            // note: if 2FA is disabled, this will also be true
            if (data.auth_key_isvalid === true) {
                initializeWallet(wallet);
            }
        }
    }, "json").fail(function () {
        alert('error loading wallet');
    });
});

function toHex(d) {
    return ("0" + (Number(d).toString(16))).slice(-2).toUpperCase()
}
