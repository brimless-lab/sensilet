export default {
    app:{
        has_new_version:"New Version!"
    },
    lang:{
        en:"English",
        ja:"日本語"
    },
    wallet: {
        // this.$t('wallet.') {{$t('wallet.')}} :placeholder="$t('wallet.')"

        welcome:"Sensiletへようこそ！",
        welcome_2:"Sensiletは、ブロックチェーン世界への接続を支援します。",
        welcome_3:"初めまして.",
        term:"利用規約",
        begin:"開始",

        create_wallet: "新しいウォレットを作成する",
        create_wallet_notice: "BSVとトークンを保持するための新しいウォレットを作成します",
        create_wallet_notice_2: "次の12個の単語を書き留めて、安全な場所に保管してください。:",
        mnemonic: "ニモニック",
        create_wallet_notice_3: "秘密鍵は、現在のコンピューターまたはデバイスにのみ保存されます。",
        create_wallet_notice_4: "ブラウザのストレージがクリアされたり、デバイスが破損または紛失した場合にウォレットを復元するには、これらの単語が必要になります。",
        mnemonic_saved: "私はこれらの単語を安全な場所に保存しました。",
        import_mnemonic: "ニーモニックから復元",
        import_mnemonic_2: "ニーモニックから復元",
        pre: "戻る",
        next: "次へ",
        confirm_mnemonic: "ニーモニックを確認する",
        confirm_mnemonic_placeholder: "ニーモニックを入力してください...",
        confirm_mnemonic_placeholder_2: "ニーモニックを再入力してください",

        mnemonic_notice: "ニーモニックを再入力し、保存したことを確認してください。",
        mnemonic_notice_2: "ニーモニックを安全な場所に保存し、下のチェックボックスをチェックしてください",
        mnemonic_notice_3: "確認のためにニーモニックを入力してください",
        mnemonic_error: 'ニーモニックには12個単語が含まれている必要があります',
        mnemonic_exist: 'ニーモニックはすでに存在します',
        set_password: "パスワードの選択（オプション）",
        set_password_notice: "ウォレットを保護するため、オプションでのパスワードを設定します。",
        set_password_notice_2: "パスワードを忘れた場合は、ニーモニック単語を使用してウォレットを復元する必要があります。",
        input_password: "パスワードを入力...（オプション）",
        input_password_2: "パスワードを入力...",
        input_password_again: "パスワードをもう一度入力してください...（オプション）",
        commit: "コミット",
        save_error: "追加に失敗しました（すでに存在します）",
        password_error: "パスワードが一致していません",
        back: "戻る",
        unlock_wallet: "ウォレットのロックを解除",
        keep_unlock: "アンロック状態を保持",
        unlock: "ロックを解除する",
        password_error_2: "パスワードエラー",

        mnemonic_notice_4:"ブラウザを変更したり、コンピュータを移動したりする場合は、このアカウントにアクセスするためにニーモニック単語が必要になります。 それらを安全で秘密の場所に保存しましょう。",

        private_key:"秘密鍵",
        import_private: "秘密鍵からの復元（Wif）",
        private_notice_3: "確認のために秘密鍵（Wif）を入力してください",
        confirm_private_placeholder: "秘密鍵を入力してください...",
        private_notice_4:"ブラウザを変更したり、コンピュータを移動したりする場合は、このアカウントにアクセスするためにこの秘密鍵が必要になります。 それらを安全で秘密の場所に保存します。",

        adv_options:"高度なオプション",
        options_notice:"次のオプションがわからない場合は、変更しないでください。",
        passphrase:"パスフレーズ:(オプション）",
        passphrase_notice_1:"パスフレーズは、資産をさらに保護することができます。 ニーモニックが盗まれた場合でも、パスフレーズが公開されていなければ、資産は安全です。",
        passphrase_notice_2:"パスフレーズが設定されている場合は、ニーモニックワードをインポートするときにこれを入力する必要があります。",
        passphrase_notice_3:"パスフレーズが設定されているが、パスフレーズを入力せずに12のニーモニックワードがインポートされた場合、パスフレーズのあるウォレットは復元されず、パスフレーズのない新しいウォレットが作成されます。",
        passphrase_notice_4:"パスフレーズは保存されませんので、忘れてしまうと資産を元に戻せなくなるので注意してください。",
        der_path :"派生パス：",

        passphrase_import_notice_1:"以前に設定したことがある場合は、これを入力する必要があります。",
        passphrase_import_notice_2:"間違ったパスフレーズを入力すると、復元されたウォレットは元のパスフレーズと同じウォレットにはなりません。",

        agree_term: "に同意する",
    },
    account: {
        // this.$t('account.') {{$t('account.')}} :placeholder="$t('account.')"
        receive: "受け取る",
        send: "送る",
        history: "履歴",
        hot: "ホットトークン",
        token_list: "トークンリスト",
        hot_app:"アプリ",
        input_address: "アドレスを入力",
        input_amount: "量を入力(単位:{0})",
        clip: "{0} コピーしました！",
        token_error: "無効なトークン",
        address_error: "無効なアドレス",
        amount_error: "無効な値",
        amount_error_2: "値は0より大きい必要があります",
        balance_not_enough: "残高不足です",
        add_custom_token:"カスタムトークンを追加する",

        choose:"選ぶ",
        add:"新しいアカウントを追加...",
        add_new:"新規追加（新しいニーモニックの作成）",
        alias_input:"エイリアスを入力する",

        mode_single_key:"PrivKey",
        mode_HD:"HD",

        alias_max_limit:"エイリアスに必要な文字数は12文字未満",
        alias_min_limit:"エイリアスには0文字以上が必要です",

        connected:"接続済み",
        not_connected:"接続されていません",
        open:"オープン",
        nfts:"NFTs",
        coming_soon:"近日公開",
        genesis:"ジェネシス",
        empty:"空き",
        balance:"残高",
        send_all:"全部送る",
        fee:"手数料",
        qr_title:"BSVまたはSensibleFTを受け取る",
        qr_notice:"このアドレスはBSVまたはSensibleFTトークンのみを受信できます",

        add_type_1:"新しいニーモニック（12単語）アカウントを作成する",
        add_type_2:"ニーモニックから復元",
        add_type_3:"秘密鍵から復元",

        not_display_notice: "現地の法令により、コンテンツは表示されません。",

        search_placeholder:"input name/genesis/codehash to search"


    },
    setting: {
        // this.$t('setting.') {{$t('setting.')}} :placeholder="$t('setting.')"

        expand_view: "ビューを展開",
        import_mnemonic: "ニーモニックのインポート",
        export_mnemonic: "ニーモニックのエクスポート",
        import_private_key: "秘密鍵のインポート",
        export_private_key: "秘密鍵のエクスポート（デフォルトアドレス）",
        notice_1:"ニーモニックを誰とも共有しないでください！",
        notice_2:"ニーモニックが意図せずに明らかにされた場合、あなたの資金は予期せずに送金されます。",

        edit_account_alias:"アカウントエイリアスの編集",
        delete_current_account: "現在のアカウントを削除する",
        delete_confirm:"DELETEを入力して確認します。",

        disconnect:"切断する",
        disconnect_notice:"切断してもよろしいですか？",
        account_management:"アカウント管理",
        privacy:"プライバシーポリシー",
        term:"利用規約",

        connected_web:"接続されたウェブサイト",
        empty:"空き",
        copyright:"Copyright © 2021 Sensilet.com",

        view_in_explorer:"View Account on blockcheck.info",
        change_password:"Change Password",
        change_fail:"Change fail",
        change_success:"Change success",
        input_password: "input current password (if have)",
        input_new_password: "input new password (Optional)",
        input_new_password_again: "input new password (Optional)",

    },
    popup: {
        // this.$t('popup.') {{$t('popup.')}} :placeholder="$t('popup.')"
        info_request: "Webサイトにアカウントへのアクセスを許可しますか？",
        connect_notice: "信頼できるウェブサイトにのみリンクしてください。",
        cancel: "キャンセル",
        connect: "接続",
        too_many_utxo: "UTXOが多すぎます",
        merge_notice: "続行するには、UTXOセットを最初にマージする必要があります。",
        fee: "手数料：",
        commit: "コミット",
        unknown_token: "不明なトークン",

        pay_request: "ウェブサイトは{0}の支払いを要求しています",
        sign_tx_request: "ウェブサイトは取引に署名することを要求します",
        tx_type:"トランザクションタイプ",
        sign_msg_request: "ウェブサイトはメッセージに署名することを要求します",
        sign_notice:"署名メッセージはあなたの資産を譲渡しません。",
        sign_msg:"署名するメッセージ：",
        sign:"サイン",
        receive_address: "受信アドレス：",
        amount: "支払い額：",
        balance: "残高:",
        broadcast: "ブロードキャスト:",
        yes: "はい",
        no: "いいえ",
        change: "変更",

        error_balance: "残高不足です",
        error_insufficient_balance: "残高不足です",
        error_insufficient_token: "不十分 {0}",


        trans_nft_title:"このサイトはNFTの転送を要求します",
        nft_receive:"受け取る:",
        issue_title:"NFTを発行してもよろしいですか？",
        choose_genesis:"ジェネシスを選択",
        issue:"発行",
        genesis_title:"ジェネシスによろしいですか",
        name:"名前",
        desc:"説明",
        icon:"アイコン",
        genesis:"ジェネシス",
        progress_notice_1:"MetaIdが作成され、ジェネシスが準備されます",
        success:"成功",
        fail:"失敗",
        mine:"Mine"

    },
}
