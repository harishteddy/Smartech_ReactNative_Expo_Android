//
//  NotificationService.m
//  SmartechNSE
//
//  Created by Jobin Kurian on 12/09/25.
//

#import "NotificationService.h"

@implementation NotificationService

SMTNotificationServiceExtension *smartechServiceExtension;

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    
    if ([[SmartPush sharedInstance] isNotificationFromSmartech:request.content.userInfo]) {
      smartechServiceExtension = [[SMTNotificationServiceExtension alloc] init];
      [smartechServiceExtension didReceiveNotificationRequest:request withContentHandler:contentHandler];
    }
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    [smartechServiceExtension serviceExtensionTimeWillExpire];
}

@end
