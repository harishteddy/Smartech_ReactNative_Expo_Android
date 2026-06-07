package com.netcore.smartechreactnativeexpo

import android.app.NotificationChannelGroup
import android.app.NotificationManager
import android.content.Context
import android.net.Uri
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.netcore.android.Smartech
import com.netcore.android.smartechpush.SmartPush
import java.lang.ref.WeakReference

class SmartechFCMService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        SmartPush.getInstance(WeakReference(this)).setDevicePushToken(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        SmartPush.getInstance(WeakReference(applicationContext))
            .handlePushNotification(remoteMessage.data.toString())
    }
}
