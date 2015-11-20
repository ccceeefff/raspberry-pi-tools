//
//  SensorTableViewController.h
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SensorTableViewController : UITableViewController

@property (nonatomic, strong) NSString *server;
@property (nonatomic, assign) NSInteger port;

@end
