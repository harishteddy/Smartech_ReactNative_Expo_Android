//
//  NotificationViewController.m
//  SmartechNCE
//
//  Created by Jobin Kurian on 12/09/25.
//

#import "NotificationViewController.h"
#import <SmartPush/SmartPush.h>

@interface NotificationViewController ()

@property (weak, nonatomic) IBOutlet UIView *customPNView;

@end

@implementation NotificationViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any required interface initialization here.
    self.customView = _customPNView;
}

@end
