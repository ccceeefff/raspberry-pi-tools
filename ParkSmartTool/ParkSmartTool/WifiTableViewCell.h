//
//  WifiTableViewCell.h
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/20/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface WifiTableViewCell : UITableViewCell

@property (nonatomic, weak) IBOutlet UILabel *ssid;
@property (nonatomic, weak) IBOutlet UILabel *frequency;
@property (nonatomic, weak) IBOutlet UILabel *signalStrength;
@property (nonatomic, weak) IBOutlet UILabel *channel;

@end
